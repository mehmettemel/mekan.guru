# Database Migrations Documentation

This document lists and explains the database migrations used in the LocalFlavors project.

## Migration Files

### `001_initial_schema.sql`
- **Purpose**: Sets up the initial database schema.
- **Tables**: `users`, `locations`, `categories`, `places`, `place_images`.
- **Features**: Row Level Security (RLS) policies, basic triggers for timestamps.

### `003_collections_schema.sql`
- **Purpose**: Introduces the Collections feature.
- **Tables**: `collections`, `collection_places`, `collection_votes`.
- **Features**: 
    - `collections`: Stores user-curated lists.
    - `collection_places`: Join table linking collections to places with ordering.
    - `collection_votes`: Stores user votes on collections.
    - Triggers to update `vote_count` and `vote_score` on collections.

### `004_auth_setup.sql`
- **Purpose**: Configures Supabase Auth integration.
- **Features**: 
    - Creates a trigger to automatically create a public `users` record when a new user signs up via Supabase Auth.
    - Sets up RLS policies for user profiles.

### `011_simplify_collections.sql`
- **Purpose**: Simplifies the collection schema.
- **Changes**: 
    - Removes complex dependencies or unused fields from the initial collection implementation.
    - Ensures `collections` table is streamlined for the MVP.

### `012_add_google_place_id.sql`
- **Purpose**: Adds Google Places integration support.
- **Changes**: 
    - Adds `google_place_id` column to `places` table.
    - Adds `google_maps_uri` and other fields to store Google Places data.
    - Ensures unique constraint on `google_place_id` to prevent duplicates.

### `013_api_usage_tracking.sql`
- **Purpose**: Adds rate limiting and API usage tracking.
- **Tables**: `api_usage_logs`.
- **Features**: 
    - Tracks API calls to Google Places to monitor costs.
    - Implements rate limiting logic (if used with RLS or edge functions).

### `014_fix_collections_location_fk.sql`
- **Purpose**: Fixes a foreign key issue with collections.
- **Changes**: 
    - Restores the foreign key relationship between `collections` and `locations`.
    - Ensures `location_id` is properly constrained but allows for flexibility if needed (nullable in some contexts).

## Applying Migrations

Migrations are applied using the Supabase CLI or by running the SQL scripts in the Supabase Dashboard SQL Editor.

```bash
# Apply migrations locally
supabase db reset
```

## Schema Overview

The core entities are:
- **Users**: Extends Supabase Auth users.
- **Locations**: Hierarchical (Country -> City -> District).
- **Categories**: Hierarchical (Main -> Sub).
- **Collections**: The main content unit, linking a User, Location, and Category to a list of Places.
- **Places**: The actual venues, stored with Google Places data.
- **Votes**: User interactions with collections.
