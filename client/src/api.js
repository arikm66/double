// Delete a pack
export const deletePack = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/packs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete pack');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting pack:', error);
    throw error;
  }
};

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

// Fetch all packs
export const fetchAllPacks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/packs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch packs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching packs:', error);
    throw error;
  }
};
