const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchMessage = async () => {
  try {
    const response = await fetch(`${API_URL}/api/test`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
