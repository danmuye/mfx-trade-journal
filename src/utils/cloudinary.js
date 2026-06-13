export const uploadScreenshot = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'muyefx_unsigned'); // You'll create this in Cloudinary
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dsfprztod/image/upload`,
    { method: 'POST', body: formData }
  );
  
  if (!response.ok) {
    throw new Error('Image upload failed');
  }
  
  const data = await response.json();
  return data.secure_url; // URL to store in Firestore
};