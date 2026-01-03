-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materiales', 'materiales', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to the materiales bucket
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materiales');

-- Allow everyone to view materials
CREATE POLICY "Anyone can view materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'materiales');

-- Allow authenticated users to delete their own materials
CREATE POLICY "Authenticated users can delete materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materiales');