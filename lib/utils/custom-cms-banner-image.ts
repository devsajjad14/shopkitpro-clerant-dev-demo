// Utility for custom-cms banner image upload (Vercel Blob version)

export async function uploadCustomCmsBannerImage(file: File, bannerName: string): Promise<{ imageUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bannerName', bannerName);

  const res = await fetch('/api/upload/main-banner', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

export async function uploadCustomCmsMiniBannerImage(file: File, bannerName: string): Promise<{ imageUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bannerName', bannerName);

  const res = await fetch('/api/upload/mini-banner', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

export async function deleteCustomCmsBannerImage(imageUrl: string) {
  await fetch(`/api/upload/main-banner?url=${encodeURIComponent(imageUrl)}`, {
    method: 'DELETE',
  });
}

export async function deleteCustomCmsMiniBannerImage(imageUrl: string) {
  await fetch(`/api/upload/mini-banner?url=${encodeURIComponent(imageUrl)}`, {
    method: 'DELETE',
  });
}

export function getCustomCmsBannerImageUrl(filename: string) {
  return `/uploads/main-banners/${filename}`;
}

export function getCustomCmsMiniBannerImageUrl(filename: string) {
  return `/uploads/mini-banners/${filename}`;
} 