import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabase.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { clientCanAccessProject, isAdmin } from '../lib/authorization.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

router.get('/:projectId/files', authenticate, async (req, res) => {
  const projectId = String(req.params.projectId);
  if (!isAdmin(req)) {
    const allowed = await clientCanAccessProject(req.user!.id, projectId);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const filesWithUrls = await Promise.all(
    (data ?? []).map(async (file) => {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(file.storage_path, 3600);
      return { ...file, download_url: signed?.signedUrl };
    })
  );

  res.json(filesWithUrls);
});

router.post(
  '/:projectId/files',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    const projectId = String(req.params.projectId);

    if (!isAdmin(req)) {
      const allowed = await clientCanAccessProject(req.user!.id, projectId);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const storagePath = `${projectId}/${uuidv4()}-${req.file.originalname}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data, error } = await supabaseAdmin
      .from('files')
      .insert({
        project_id: projectId,
        name: req.file.originalname,
        size_bytes: req.file.size,
        storage_path: storagePath,
        uploaded_by: req.user!.id,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  }
);

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const { data: file, error: fetchError } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !file) {
    return res.status(404).json({ error: 'File not found' });
  }

  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([file.storage_path]);

  const { error } = await supabaseAdmin.from('files').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ success: true });
});

export default router;
