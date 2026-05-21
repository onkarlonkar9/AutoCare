
-- Create storage bucket for service bill uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-bills', 'service-bills', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own bills
CREATE POLICY "Users can upload service bills"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'service-bills' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to view their own bills
CREATE POLICY "Users can view own service bills"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'service-bills' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read for bills (since bucket is public)
CREATE POLICY "Public can view service bills"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'service-bills');
