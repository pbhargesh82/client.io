import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, STORAGE_BUCKET } from './supabase.js';

export async function signedFileUrl(storagePath: string): Promise<string | undefined> {
  const { data } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl;
}

export async function filesWithSignedUrls<T extends { storage_path: string }>(
  files: T[]
): Promise<(T & { download_url?: string })[]> {
  return Promise.all(
    files.map(async (file) => ({
      ...file,
      download_url: await signedFileUrl(file.storage_path),
    }))
  );
}

export function projectFileStoragePath(projectId: string, originalName: string): string {
  return `${projectId}/${uuidv4()}-${originalName}`;
}

export function commentAttachmentStoragePath(
  projectId: string,
  taskId: string,
  commentId: string,
  originalName: string
): string {
  return `${projectId}/tasks/${taskId}/comments/${commentId}/${uuidv4()}-${originalName}`;
}

export async function uploadFileBuffer(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
}
