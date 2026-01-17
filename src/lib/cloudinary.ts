export const uploadToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'doctors_images');
    formData.append('cloud_name', 'dr5waimt0');
    formData.append('folder', 'doctors'); // Save in a specific folder

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dr5waimt0/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
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
      throw new Error('Failed to upload voice recording');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading voice to Cloudinary:', error);
    throw error;
  }
};