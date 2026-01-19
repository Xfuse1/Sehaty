export const uploadToCloudinary = async (file: File, folder: string = 'doctors') => {
  try {
    const cloudName = 'dr5waimt0';
    const uploadPreset = 'doctors_images';

    console.log('--- Cloudinary Upload Start ---');
    console.log('Folder:', folder);
    console.log('File details:', { name: file.name, type: file.type, size: file.size });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Cloudinary Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary Error Detail:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }

    const data = await response.json();
    console.log('Cloudinary Upload Success. Secure URL:', data.secure_url);
    console.log('--- Cloudinary Upload End ---');
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    console.log('--- Cloudinary Upload Failed ---');
    throw error;
  }
};

export const uploadVoiceToCloudinary = async (blob: Blob) => {
  try {
    // Convert Blob to File
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'doctors_images');
    formData.append('cloud_name', 'dr5waimt0');
    formData.append('folder', 'voice-messages');
    formData.append('resource_type', 'video'); // Cloudinary treats audio as video

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dr5waimt0/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary Voice Error Detail:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload voice recording');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading voice to Cloudinary:', error);
    throw error;
  }
};