/*
  # Subscriptions and Code Versions Tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_email` (text) - User email
      - `plan_type` (text) - Plan type (basic, pro, ultimate)
      - `status` (text) - Subscription status (active, cancelled, expired)
      - `expires_at` (timestamptz) - Expiration date
      - `payment_method` (text) - Payment method used
      - `transaction_hash` (text) - Transaction hash for crypto payments
      - `created_date` (timestamptz)
      
    - `code_versions`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - Reference to project
      - `code` (text) - Code content
      - `html_preview` (text) - HTML preview
      - `version_number` (integer) - Version number
      - `description` (text) - Version description
      - `created_by_message` (text) - Message that created this version
      - `created_date` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    
  3. Important Notes
    - Subscriptions track user plan status
    - Code versions maintain project history
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  plan_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  payment_method text,
  transaction_hash text,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS code_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  code text NOT NULL,
  html_preview text,
  version_number integer DEFAULT 1,
  description text,
  created_by_message text,
  created_date timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (user_email = current_user);

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_email = current_user);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE TO authenticated
  USING (user_email = current_user)
  WITH CHECK (user_email = current_user);

CREATE POLICY "Users can read code versions from their projects"
  ON code_versions FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE POLICY "Users can create code versions for their projects"
  ON code_versions FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_code_versions_project_id ON code_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_version_number ON code_versions(version_number);
