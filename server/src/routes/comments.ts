import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { clientCanAccessTask, isAdmin } from '../lib/authorization.js';
import {
  commentAttachmentStoragePath,
  filesWithSignedUrls,
  uploadFileBuffer,
} from '../lib/fileStorage.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
const MAX_ATTACHMENTS = 5;

const router = Router();

type CommentRow = {
  id: string;
  task_id: string;
  user_id: string;
  body: string | null;
  created_at: string;
  users: { name: string; role: string };
};

function attachmentPayload(
  file: {
    id: string;
    name: string;
    size_bytes: number;
    content_type: string | null;
    created_at: string;
    download_url?: string;
  }
) {
  return {
    id: file.id,
    name: file.name,
    size_bytes: file.size_bytes,
    content_type: file.content_type,
    created_at: file.created_at,
    download_url: file.download_url,
  };
}

function mapComment(
  c: CommentRow,
  attachments: Array<{
    id: string;
    name: string;
    size_bytes: number;
    content_type: string | null;
    created_at: string;
    download_url?: string;
  }> = []
) {
  return {
    id: c.id,
    task_id: c.task_id,
    user_id: c.user_id,
    body: c.body,
    created_at: c.created_at,
    user: c.users,
    attachments: attachments.map(attachmentPayload),
  };
}

router.get('/:taskId/comments', authenticate, async (req, res) => {
  const taskId = String(req.params.taskId);
  if (!isAdmin(req)) {
    const allowed = await clientCanAccessTask(req.user!.id, taskId);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, users(name, role)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const comments = (data ?? []) as CommentRow[];
  const commentIds = comments.map((c) => c.id);

  let attachmentsByComment = new Map<
    string,
    Array<{
      id: string;
      name: string;
      size_bytes: number;
      content_type: string | null;
      created_at: string;
      download_url?: string;
    }>
  >();

  if (commentIds.length > 0) {
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('*')
      .in('comment_id', commentIds)
      .order('created_at', { ascending: true });

    if (filesError) throw new Error(filesError.message);

    const withUrls = await filesWithSignedUrls(files ?? []);
    for (const file of withUrls) {
      const cid = file.comment_id as string;
      const list = attachmentsByComment.get(cid) ?? [];
      list.push({
        id: file.id,
        name: file.name,
        size_bytes: file.size_bytes,
        content_type: file.content_type ?? null,
        created_at: file.created_at,
        download_url: file.download_url,
      });
      attachmentsByComment.set(cid, list);
    }
  }

  res.json(comments.map((c) => mapComment(c, attachmentsByComment.get(c.id) ?? [])));
});

router.post(
  '/:taskId/comments',
  authenticate,
  upload.array('files', MAX_ATTACHMENTS),
  async (req, res) => {
    const taskId = String(req.params.taskId);
    if (!isAdmin(req)) {
      const allowed = await clientCanAccessTask(req.user!.id, taskId);
      if (!allowed) return res.status(403).json({ error: 'Access denied' });
    }

    const bodyText = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (!bodyText && files.length === 0) {
      return res.status(400).json({ error: 'Add a comment or attach at least one file' });
    }
    if (files.length > MAX_ATTACHMENTS) {
      return res.status(400).json({ error: `Maximum ${MAX_ATTACHMENTS} files per comment` });
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: req.user!.id,
        body: bodyText || null,
      })
      .select('*, users(name, role)')
      .single();

    if (error || !comment) {
      return res.status(400).json({ error: error?.message ?? 'Failed to create comment' });
    }

    const attachmentRows: Array<{
      id: string;
      name: string;
      size_bytes: number;
      content_type: string | null;
      created_at: string;
      download_url?: string;
    }> = [];

    try {
      for (const file of files) {
        const storagePath = commentAttachmentStoragePath(
          task.project_id,
          taskId,
          comment.id,
          file.originalname
        );

        await uploadFileBuffer(storagePath, file.buffer, file.mimetype);

        const { data: row, error: insertError } = await supabaseAdmin
          .from('files')
          .insert({
            project_id: task.project_id,
            task_id: taskId,
            comment_id: comment.id,
            name: file.originalname,
            size_bytes: file.size,
            storage_path: storagePath,
            content_type: file.mimetype,
            uploaded_by: req.user!.id,
          })
          .select('*')
          .single();

        if (insertError || !row) {
          throw new Error(insertError?.message ?? 'Failed to save attachment');
        }

        const [withUrl] = await filesWithSignedUrls([row]);
        attachmentRows.push({
          id: withUrl.id,
          name: withUrl.name,
          size_bytes: withUrl.size_bytes,
          content_type: withUrl.content_type ?? null,
          created_at: withUrl.created_at,
          download_url: withUrl.download_url,
        });
      }
    } catch (uploadErr) {
      await supabaseAdmin.from('comments').delete().eq('id', comment.id);
      const message = uploadErr instanceof Error ? uploadErr.message : 'Upload failed';
      return res.status(400).json({ error: message });
    }

    res.status(201).json(mapComment(comment as CommentRow, attachmentRows));
  }
);

export default router;
