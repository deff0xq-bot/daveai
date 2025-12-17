/*
  # Complete Base Tables Setup

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_email` (text) - User who owns the project
      - `name` (text) - Project name
      - `description` (text) - Project description
      - `status` (text) - Project status (draft, generating, ready)
      - `code` (text) - Generated code
      - `html_preview` (text) - HTML preview
      - `files` (jsonb) - Attached files
      - `created_date` (timestamptz)
      
    - `messages`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - Reference to project
      - `role` (text) - Message role (user, assistant)
      - `content` (text) - Message content
      - `attached_files` (jsonb) - Files attached to message
      - `credits_used` (integer) - Credits consumed
      - `created_date` (timestamptz)
      
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_email` (text) - User email
      - `amount` (integer) - Transaction amount (positive or negative)
      - `type` (text) - Transaction type (purchase, generation, daily_bonus)
      - `description` (text) - Transaction description
      - `project_id` (uuid) - Optional project reference
      - `created_date` (timestamptz)
      
    - `deployments`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - Reference to project
      - `platform` (text) - Deployment platform
      - `url` (text) - Deployed URL
      - `status` (text) - Deployment status
      - `build_log` (text) - Build logs
      - `metadata` (jsonb) - Additional metadata
      - `created_date` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    
  3. Important Notes
    - All tables use email-based authentication
    - RLS ensures users only access their own data
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft',
  code text,
  html_preview text,
  files jsonb DEFAULT '[]'::jsonb,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  attached_files jsonb DEFAULT '[]'::jsonb,
  credits_used integer DEFAULT 0,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  project_id uuid,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'cloudflare',
  url text,
  status text NOT NULL DEFAULT 'pending',
  build_log text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_date timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own projects"
  ON projects FOR SELECT TO authenticated
  USING (user_email = current_user);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (user_email = current_user);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE TO authenticated
  USING (user_email = current_user)
  WITH CHECK (user_email = current_user);

CREATE POLICY "Users can read messages from their projects"
  ON messages FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE POLICY "Users can create messages in their projects"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE POLICY "Users can read their own transactions"
  ON credit_transactions FOR SELECT TO authenticated
  USING (user_email = current_user);

CREATE POLICY "Users can create transactions"
  ON credit_transactions FOR INSERT TO authenticated
  WITH CHECK (user_email = current_user);

CREATE POLICY "Users can read their deployments"
  ON deployments FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE POLICY "Users can create deployments"
  ON deployments FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_email = current_user));

CREATE INDEX IF NOT EXISTS idx_projects_user_email ON projects(user_email);
CREATE INDEX IF NOT EXISTS idx_projects_created_date ON projects(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_date ON messages(created_date);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_email ON credit_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_date ON credit_transactions(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_created_date ON deployments(created_date DESC);
