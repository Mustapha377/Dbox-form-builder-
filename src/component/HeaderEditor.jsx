import React, { useState } from 'react';
import { Upload, X, Image, Palette, RefreshCw } from 'lucide-react';

const HeaderEditor = ({ 
  formData, 
  setFormData, 
  previewMode, 
  onTitleChange, 
  onDescriptionChange, 
  onImageChange 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImageError(false);
        if (onImageChange) {
          onImageChange(imageUrl);
        } else {
          setFormData(prev => ({ ...prev, headerImage: imageUrl }));
        }
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setImageError(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setImageError(false);
          if (onImageChange) {
            onImageChange(imageUrl);
          } else {
            setFormData(prev => ({ ...prev, headerImage: imageUrl }));
          }
        };
        reader.onerror = () => {
          alert('Failed to read image file');
          setImageError(true);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const removeImage = () => {
    if (onImageChange) {
      onImageChange(null);
    } else {
      setFormData(prev => ({ ...prev, headerImage: null }));
    }
    setImageError(false);
  };

  const handleTitleChangeInternal = (newTitle) => {
    if (onTitleChange) {
      onTitleChange(newTitle);
    } else {
      setFormData(prev => ({ ...prev, title: newTitle }));
    }
  };

  const handleDescriptionChangeInternal = (newDescription) => {
    if (onDescriptionChange) {
      onDescriptionChange(newDescription);
    } else {
      setFormData(prev => ({ ...prev, description: newDescription }));
    }
  };

  if (previewMode) {
    return (
      <div className="relative">
        {formData.headerImage && (
          <div className="relative">
            {imageError ? (
              <div className="w-full h-48 lg:h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Failed to load image</p>
                </div>
              </div>
            ) : (
              <img 
                src={formData.headerImage} 
                alt="Form header" 
                className="w-full h-48 lg:h-64 object-cover"
                onError={() => {
                  console.error('Header image failed to load');
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('Header image loaded successfully');
                  setImageError(false);
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 flex items-end">
              <div className="p-6 lg:p-8 text-white w-full">
                <h1 
                  className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 drop-shadow-lg"
                  style={{ color: formData.accentColor || '#ffffff' }}
                >
                  {formData.title}
                </h1>
                {formData.description && (
                  <p className="text-base lg:text-lg opacity-90 drop-shadow">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!formData.headerImage && (
          <div 
            className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100"
            style={{ 
              background: `linear-gradient(135deg, ${formData.accentColor}08 0%, ${formData.accentColor}02 100%)`
            }}
          >
            <h1 
              className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 transition-colors duration-300"
              style={{ color: formData.accentColor || '#1f2937' }}
            >
              {formData.title}
            </h1>
            {formData.description && (
              <p className="text-base lg:text-lg text-gray-600">
                {formData.description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {formData.headerImage ? (
        <div className="relative group">
          {imageError ? (
            <div className="w-full h-48 lg:h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Failed to load image</p>
                <button
                  onClick={removeImage}
                  className="mt-2 px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
            <img 
              src={formData.headerImage} 
              alt="Form header" 
              className="w-full h-48 lg:h-64 object-cover"
              onError={() => {
                console.error('Header image failed to load');
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Header image loaded successfully');
                setImageError(false);
              }}
            />
          )}
          
          {/* Enhanced button controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="header-image-change"
            />
            <label
              htmlFor="header-image-change"
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg cursor-pointer flex items-center justify-center"
              title="Change image"
            >
              <RefreshCw className="w-4 h-4" />
            </label>
            <button
              onClick={removeImage}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 flex items-end">
            <div className="p-6 lg:p-8 text-white w-full">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChangeInternal(e.target.value)}
                className="text-2xl lg:text-4xl font-bold bg-transparent border-none outline-none w-full mb-2 lg:mb-4 placeholder-white placeholder-opacity-75 drop-shadow-lg"
                style={{ color: formData.accentColor || '#ffffff' }}
                placeholder="Form Title"
                onClick={(e) => e.stopPropagation()}
              />
              <textarea
                value={formData.description}
                onChange={(e) => handleDescriptionChangeInternal(e.target.value)}
                placeholder="Form description"
                className="text-base lg:text-lg bg-transparent border-none outline-none w-full resize-none placeholder-white placeholder-opacity-75 drop-shadow"
                rows={2}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${formData.accentColor}08 0%, ${formData.accentColor}02 100%)`
          }}
        >
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChangeInternal(e.target.value)}
            className="text-2xl lg:text-4xl font-bold bg-transparent border-none outline-none w-full mb-2 lg:mb-4 placeholder-gray-400 transition-colors duration-300"
            style={{ color: formData.accentColor || '#1f2937' }}
            placeholder="Form Title"
            onClick={(e) => e.stopPropagation()}
          />
          <textarea
            value={formData.description}
            onChange={(e) => handleDescriptionChangeInternal(e.target.value)}
            placeholder="Form description"
            className="text-base lg:text-lg bg-transparent border-none outline-none w-full resize-none text-gray-600 placeholder-gray-400"
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Add Header Image Section */}
          <div className="mt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">
                Drag and drop an image or click to upload
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="header-image-upload"
              />
              <label
                htmlFor="header-image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium"
                style={{ 
                  borderColor: formData.accentColor + '40',
                  color: formData.accentColor 
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = formData.accentColor + '08';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                }}
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderEditor;