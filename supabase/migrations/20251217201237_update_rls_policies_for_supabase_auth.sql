/*
  # Update RLS Policies for Supabase Auth

  1. Changes
    - Drop all existing RLS policies
    - Create new policies using auth.jwt() for email verification
    - Policies now work with Supabase Auth instead of Base44
  
  2. Security
    - Users can only access their own data
    - Email-based access control using auth.jwt()
    
  3. Important Notes
    - Policies use auth.jwt()->>'email' to get user email
    - All operations are restricted to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can read messages from their projects" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their projects" ON messages;
DROP POLICY IF EXISTS "Users can read their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can read their deployments" ON deployments;
DROP POLICY IF EXISTS "Users can create deployments" ON deployments;

-- Projects policies
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_email = (SELECT auth.jwt()->>'email'));

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (SELECT auth.jwt()->>'email'));

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_email = (SELECT auth.jwt()->>'email'))
  WITH CHECK (user_email = (SELECT auth.jwt()->>'email'));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_email = (SELECT auth.jwt()->>'email'));

-- Messages policies
CREATE POLICY "Users can read messages from own projects"
  ON messages FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));

CREATE POLICY "Users can create messages in own projects"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));

CREATE POLICY "Users can update messages in own projects"
  ON messages FOR UPDATE
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));

-- Credit transactions policies
CREATE POLICY "Users can read own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (user_email = (SELECT auth.jwt()->>'email'));

CREATE POLICY "Users can create own transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (SELECT auth.jwt()->>'email'));

-- Deployments policies
CREATE POLICY "Users can read own deployments"
  ON deployments FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));

CREATE POLICY "Users can create deployments for own projects"
  ON deployments FOR INSERT
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));

CREATE POLICY "Users can update own deployments"
  ON deployments FOR UPDATE
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects 
    WHERE user_email = (SELECT auth.jwt()->>'email')
  ));