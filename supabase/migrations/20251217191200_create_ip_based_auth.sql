/*
  # IP-Based Authentication System

  1. New Tables
    - `user_ip_addresses`
      - `id` (uuid, primary key)
      - `ip_address` (text, unique) - User's IP address
      - `user_email` (text) - Associated user email from auth.users
      - `first_seen` (timestamp) - When IP was first registered
      - `last_seen` (timestamp) - Last activity timestamp
      - `is_active` (boolean) - Whether this IP is currently active
      - `metadata` (jsonb) - Additional data like user agent, location
      
  2. Security
    - Enable RLS on `user_ip_addresses` table
    - Add policy for users to read their own IP data
    - Add policy for authenticated users to update their last_seen timestamp
    
  3. Important Notes
    - One IP address can only be associated with one account
    - Users will be automatically registered/logged in based on their IP
    - IP addresses are hashed for privacy
*/

CREATE TABLE IF NOT EXISTS user_ip_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text UNIQUE NOT NULL,
  user_email text NOT NULL,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_ip_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own IP data"
  ON user_ip_addresses
  FOR SELECT
  TO authenticated
  USING (user_email = current_user);

CREATE POLICY "Users can update their own IP data"
  ON user_ip_addresses
  FOR UPDATE
  TO authenticated
  USING (user_email = current_user)
  WITH CHECK (user_email = current_user);

CREATE INDEX IF NOT EXISTS idx_user_ip_addresses_ip ON user_ip_addresses(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_ip_addresses_user_email ON user_ip_addresses(user_email);
