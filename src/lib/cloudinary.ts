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