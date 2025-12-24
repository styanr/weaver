import { StorageClient } from '@supabase/storage-js';

import { STORAGE_URL, SERVICE_KEY } from '$env/static/private';

const BUCKET_NAME = 'ogimages';

const storageClient = new StorageClient(STORAGE_URL, {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

export const existsOgImage = async (path: string) => {
  const { data } = await storageClient.from(BUCKET_NAME).exists(path);
  return data;
};

export const downloadOgImage = async (path: string) => {
  return await storageClient.from(BUCKET_NAME).download(path);
};

export const uploadOgImage = async (path: string, data: Blob) => {
  return await storageClient
    .from(BUCKET_NAME)
    .upload(path, data, { contentType: data.type });
};
