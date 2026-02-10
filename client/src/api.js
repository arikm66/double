export const fetchMessage = async () => {
  try {
    const response = await fetch(`/api/test`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
