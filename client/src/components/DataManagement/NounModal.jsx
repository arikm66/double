import { useState, useEffect } from 'react';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';

function NounModal({ show, onClose, noun, categories, onSave, loading, onError }) {
  const [nounForm, setNounForm] = useState({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (noun) {
      setNounForm({
        nameEn: noun.nameEn,
        nameHe: noun.nameHe,
        category: noun.category._id,
        imageUrl: noun.imageUrl || ''
      });
      setImagePreview(noun.imageUrl || '');
      setSelectedImage(null);
    } else {
      setNounForm({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
      setImagePreview('');
      setSelectedImage(null);
    }
  }, [noun]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setNounForm({ ...nounForm, imageUrl: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = nounForm.imageUrl;
      
      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(selectedImage, 'nouns');
          
          // Delete old image if updating and had a previous image
          if (noun && noun.imageUrl && noun.imageUrl !== imageUrl) {
            try {
              await deleteImage(noun.imageUrl);
            } catch (deleteError) {
              console.error('Error deleting old image:', deleteError);
              // Continue even if delete fails
            }
          }
        } catch (uploadError) {
          onError('Failed to upload image: ' + uploadError.message);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      await onSave({ ...nounForm, imageUrl }, noun);
      
      // Reset form on successful save
      setNounForm({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
      setSelectedImage(null);
      setImagePreview('');
    } catch (err) {
      // Error handling is done by parent
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{cursor: uploadingImage ? 'wait' : 'default'}}>
        <h3>{noun ? 'Edit Noun' : 'Add Noun'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>English Name</label>
            <input
              type="text"
              value={nounForm.nameEn}
              onChange={(e) => setNounForm({ ...nounForm, nameEn: e.target.value })}
              required
              placeholder="Enter English name"
            />
          </div>
          <div className="form-group">
            <label>Hebrew Name</label>
            <input
              type="text"
              value={nounForm.nameHe}
              onChange={(e) => setNounForm({ ...nounForm, nameHe: e.target.value })}
              required
              placeholder="Enter Hebrew name"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={nounForm.category}
              onChange={(e) => setNounForm({ ...nounForm, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.categoryHe}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Image {uploadingImage && <span className="uploading-indicator"><CircularProgress size={14} /></span>}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploadingImage}
              style={{cursor: uploadingImage ? 'wait' : 'pointer'}}
            />
            {imagePreview && (
              <div className="image-preview" style={{opacity: uploadingImage ? 0.6 : 1}}>
                {uploadingImage && (
                  <div className="upload-spinner">
                    <div className="spinner"></div>
                    <p>Uploading image...</p>
                  </div>
                )}
                <img src={imagePreview} alt="Preview" style={{filter: uploadingImage ? 'blur(2px)' : 'none'}} />
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  disabled={uploadingImage}
                  style={{cursor: uploadingImage ? 'wait' : 'pointer'}}
                >
                  Remove Image
                </button>
              </div>
            )}
            <small>Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)</small>
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading || uploadingImage} style={{cursor: (loading || uploadingImage) ? 'wait' : 'pointer'}}>
              {uploadingImage ? (<><CircularProgress size={14} style={{ marginRight: 8 }} />Uploading Image...</>) : loading ? (<><SaveIcon style={{ marginRight: 8 }} />Saving...</>) : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-btn"
              disabled={uploadingImage}
              style={{cursor: uploadingImage ? 'not-allowed' : 'pointer'}}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NounModal;
