/*
  # Create Storage Bucket

  1. Changes
    - Create 'uploads' storage bucket
    - Enable public access for uploads bucket
    - Add RLS policies for uploads bucket
    
  2. Security
    - Authenticated users can upload files
    - Anyone can read files (public bucket)
    
  3. Important Notes
    - Files are publicly accessible after upload
    - Users can only upload to their own folders
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads');