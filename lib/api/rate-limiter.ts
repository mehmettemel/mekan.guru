import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export interface RateLimitConfig {
  maxPerMinute?: number;
  maxPerHour?: number;
  maxPerDay?: number;
  costPerRequest?: number; // In USD
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'places/search': {
    maxPerMinute: 10,
    maxPerHour: 100,
    maxPerDay: 500,
    costPerRequest: 0.017, // Google Places Autocomplete cost
  },
  'places/details': {
    maxPerMinute: 5,
    maxPerHour: 50,
    maxPerDay: 200,
    costPerRequest: 0.017, // Google Places Details cost
  },
};

export async function checkRateLimit(
  endpoint: string,
  userId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                     headersList.get('x-real-ip') ||
                     'unknown';

    const config = RATE_LIMITS[endpoint];
    if (!config) {
      return { allowed: true };
    }

    // Check rate limit using Supabase function
    const { data, error } = await supabase.rpc('check_api_rate_limit', {
      p_user_id: userId || null,
      p_ip_address: ipAddress,
      p_endpoint: endpoint,
      p_max_per_minute: config.maxPerMinute || 10,
      p_max_per_hour: config.maxPerHour || 100,
      p_max_per_day: config.maxPerDay || 500,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if check fails
      return { allowed: true };
    }

    if (!data) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Please try again later.',
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open - allow request if something goes wrong
    return { allowed: true };
  }
}

export async function logApiUsage(
  endpoint: string,
  userId?: string,
  additionalData?: {
    responseStatus?: number;
    requestParams?: any;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                     headersList.get('x-real-ip') ||
                     'unknown';
    const userAgent = additionalData?.userAgent || headersList.get('user-agent') || 'unknown';

    const config = RATE_LIMITS[endpoint];
    const costUnits = config?.costPerRequest || 0.01;

    // Log using Supabase function
    await supabase.rpc('log_api_usage', {
      p_user_id: userId || null,
      p_ip_address: ipAddress,
      p_endpoint: endpoint,
      p_cost_units: costUnits,
    });

    // Also insert detailed log
    await supabase.from('api_usage_logs').insert({
      user_id: userId || null,
      ip_address: ipAddress,
      endpoint,
      user_agent: userAgent,
      request_params: additionalData?.requestParams || null,
      response_status: additionalData?.responseStatus || 200,
      cost_units: costUnits,
    });
  } catch (error) {
    console.error('API usage logging error:', error);
    // Don't throw - logging shouldn't break the request
  }
}

// In-memory cache for recent searches (to reduce API calls)
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedSearch(query: string): any | null {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  searchCache.delete(query.toLowerCase());
  return null;
}

export function setCachedSearch(query: string, data: any): void {
  // Limit cache size to prevent memory issues
  if (searchCache.size > 1000) {
    // Remove oldest entries
    const sortedEntries = Array.from(searchCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    sortedEntries.slice(0, 500).forEach(([key]) => searchCache.delete(key));
  }

  searchCache.set(query.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
}

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}, 60 * 1000); // Every minute
