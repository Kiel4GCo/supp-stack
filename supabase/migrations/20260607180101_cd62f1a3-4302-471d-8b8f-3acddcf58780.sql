
CREATE POLICY "Users read own bloodwork files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bloodwork-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own bloodwork files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bloodwork-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own bloodwork files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bloodwork-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own bloodwork files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bloodwork-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
