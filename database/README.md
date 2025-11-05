# Database Schema

This directory contains database schema definitions and migrations for the Supabase database.

## Files

- `schema.sql` - Initial database schema for the businesses table
  - Run this in your Supabase SQL Editor to create the businesses table
  - Includes indexes and triggers for optimal performance

## Usage

1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the SQL script

## Future Migrations

When adding new migrations, follow this naming convention:
- `001_initial_schema.sql` (already done as `schema.sql`)
- `002_add_hours_table.sql`
- `003_add_photos_table.sql`
- etc.

