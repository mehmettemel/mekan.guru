-- API Usage Tracking for Cost Control
-- This migration adds tables and functions to track and limit Google Places API usage

-- API Usage Log Table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- 'places/search' or 'places/details'
  ip_address TEXT,
  user_agent TEXT,
  request_params JSONB,
  response_status INTEGER,
  cost_units DECIMAL(10, 4) DEFAULT 0, -- Track cost in units (e.g., $0.017 per autocomplete request)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_usage_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_usage_created_at ON api_usage_logs(created_at);
CREATE INDEX idx_api_usage_ip_address ON api_usage_logs(ip_address);

-- Daily Usage Summary (for quick lookups)
CREATE TABLE IF NOT EXISTS api_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  endpoint TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, endpoint)
);

-- Rate Limiting Table (per user/IP)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint),
  UNIQUE(ip_address, endpoint)
);

CREATE INDEX idx_rate_limits_user_id ON api_rate_limits(user_id);
CREATE INDEX idx_rate_limits_ip_address ON api_rate_limits(ip_address);
CREATE INDEX idx_rate_limits_window_start ON api_rate_limits(window_start);

-- API Budget Table (global limits)
CREATE TABLE IF NOT EXISTS api_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period TEXT NOT NULL DEFAULT 'monthly', -- 'daily', 'monthly'
  max_requests INTEGER NOT NULL DEFAULT 10000,
  max_cost DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  current_requests INTEGER DEFAULT 0,
  current_cost DECIMAL(10, 2) DEFAULT 0.00,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default monthly budget
INSERT INTO api_budget (budget_period, max_requests, max_cost, period_start, period_end)
VALUES (
  'monthly',
  10000, -- 10K requests/month
  100.00, -- $100/month max
  DATE_TRUNC('month', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
) ON CONFLICT DO NOTHING;

-- Function to check if API call is allowed
CREATE OR REPLACE FUNCTION check_api_rate_limit(
  p_user_id UUID,
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_max_per_minute INTEGER DEFAULT 10,
  p_max_per_hour INTEGER DEFAULT 100,
  p_max_per_day INTEGER DEFAULT 500
) RETURNS BOOLEAN AS $$
DECLARE
  v_count_minute INTEGER;
  v_count_hour INTEGER;
  v_count_day INTEGER;
  v_budget_exceeded BOOLEAN;
BEGIN
  -- Check if global budget exceeded
  SELECT (current_requests >= max_requests OR current_cost >= max_cost)
  INTO v_budget_exceeded
  FROM api_budget
  WHERE is_active = true
  LIMIT 1;

  IF v_budget_exceeded THEN
    RETURN FALSE;
  END IF;

  -- Count requests in last minute (by user or IP)
  SELECT COUNT(*)
  INTO v_count_minute
  FROM api_usage_logs
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND endpoint = p_endpoint
    AND created_at > NOW() - INTERVAL '1 minute';

  IF v_count_minute >= p_max_per_minute THEN
    RETURN FALSE;
  END IF;

  -- Count requests in last hour
  SELECT COUNT(*)
  INTO v_count_hour
  FROM api_usage_logs
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND endpoint = p_endpoint
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_count_hour >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;

  -- Count requests in last day
  SELECT COUNT(*)
  INTO v_count_day
  FROM api_usage_logs
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND endpoint = p_endpoint
    AND created_at > NOW() - INTERVAL '1 day';

  IF v_count_day >= p_max_per_day THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_user_id UUID,
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_cost_units DECIMAL DEFAULT 0.017
) RETURNS VOID AS $$
BEGIN
  -- Insert usage log
  INSERT INTO api_usage_logs (user_id, ip_address, endpoint, cost_units)
  VALUES (p_user_id, p_ip_address, p_endpoint, p_cost_units);

  -- Update daily summary
  INSERT INTO api_usage_daily (date, endpoint, total_requests, total_cost, unique_users, unique_ips)
  VALUES (
    CURRENT_DATE,
    p_endpoint,
    1,
    p_cost_units,
    CASE WHEN p_user_id IS NOT NULL THEN 1 ELSE 0 END,
    CASE WHEN p_ip_address IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, endpoint) DO UPDATE
  SET
    total_requests = api_usage_daily.total_requests + 1,
    total_cost = api_usage_daily.total_cost + p_cost_units,
    updated_at = NOW();

  -- Update monthly budget
  UPDATE api_budget
  SET
    current_requests = current_requests + 1,
    current_cost = current_cost + p_cost_units,
    updated_at = NOW()
  WHERE is_active = true
    AND period_start <= NOW()
    AND period_end > NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_budget ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage logs
CREATE POLICY "Admins can view all API logs"
  ON api_usage_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can view budgets
CREATE POLICY "Admins can view API budgets"
  ON api_budget FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
