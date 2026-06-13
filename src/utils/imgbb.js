export const uploadScreenshot = async (file) => {
  if (!file) return '';

  const formData = new FormData();
  formData.append('image', file);
  
  // Get free API key from https://api.imgbb.com/
  const API_KEY = '9164a882fb5b1a58d022f742b50c1d40';
  
  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    return data.data.url;
    
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};