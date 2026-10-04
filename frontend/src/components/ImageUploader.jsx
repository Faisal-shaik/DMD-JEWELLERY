import React from 'react';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ existingImages = [], selectedFiles = [], setSelectedFiles, onDeleteExisting, onSetPrimary }) => {
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        if (!isValidType) alert(`File ${file.name} is not a valid image format (JPG, PNG, WEBP).`);
        if (!isValidSize) alert(`File ${file.name} exceeds 5MB size limit.`);
        return isValidType && isValidSize;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      <div className="border-2 border-dashed border-gold-400/40 hover:border-gold-400 rounded-2xl p-6 text-center bg-dark-900/50 transition-colors cursor-pointer relative">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-200">
            Click to upload or drag and drop jewellery images
          </p>
          <p className="text-xs text-gray-400">
            Supports JPG, JPEG, PNG, WEBP (Max 5MB per image)
          </p>
        </div>
      </div>

      {/* Existing Server Images Grid */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Uploaded Product Images ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {existingImages.map((img) => (
              <div
                key={img.id}
                className={`relative aspect-square rounded-xl overflow-hidden bg-dark-900 border ${
                  img.is_primary === 1 ? 'border-gold-400 ring-2 ring-gold-400/30' : 'border-gray-700'
                } group shadow`}
              >
                <img src={img.image_url} alt="Jewellery" className="w-full h-full object-cover" />
                
                {/* Primary Tag */}
                {img.is_primary === 1 && (
                  <span className="absolute top-2 left-2 bg-gold-gradient text-dark-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-dark-900" /> Primary
                  </span>
                )}

                {/* Image Overlay Controls */}
                <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {img.is_primary !== 1 && onSetPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(img.id)}
                      className="p-1.5 bg-gold-400 text-dark-900 rounded hover:brightness-110 text-xs font-bold"
                      title="Make Primary Image"
                    >
                      Make Primary
                    </button>
                  )}
                  {onDeleteExisting && (
                    <button
                      type="button"
                      onClick={() => onDeleteExisting(img.id)}
                      className="p-1.5 bg-rose-600 text-white rounded hover:bg-rose-500 text-xs"
                      title="Delete Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Local File Previews */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
            New Selected Files to Upload ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {selectedFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden bg-dark-900 border border-gold-400/50 group"
                >
                  <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1">
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="p-1 bg-rose-600/90 text-white rounded-full hover:bg-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-dark-900/90 p-1 text-[10px] text-gray-300 truncate text-center">
                    {file.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
