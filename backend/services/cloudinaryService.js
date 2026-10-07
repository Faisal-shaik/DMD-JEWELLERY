import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export const isCloudinaryConfigured = () => {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
};

export const cloudinaryConfig = () => {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinary;
};

// Initialize configuration on module load if environment variables are present
if (isCloudinaryConfigured()) {
  cloudinaryConfig();
}

/**
 * Uploads a local image file to Cloudinary if configured.
 * If Cloudinary credentials are not present, returns the relative local path.
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      // Ensure configuration is fresh
      cloudinaryConfig();

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'dmd_jewellery/products',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      });

      // Cleanup local temp upload file after successful Cloudinary upload
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.warn('Failed to remove temp file after Cloudinary upload:', err.message);
        }
      }

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error.message || error);
      // Fallback to local URL if Cloudinary fails
      return `/uploads/${file.filename}`;
    }
  }

  // Local fallback path
  return `/uploads/${file.filename}`;
};

/**
 * Deletes an image from Cloudinary if the URL belongs to Cloudinary.
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryConfigured()) return;

  if (imageUrl.includes('res.cloudinary.com')) {
    try {
      cloudinaryConfig();
      // Extract public_id from Cloudinary URL (e.g., dmd_jewellery/products/abc123)
      const parts = imageUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        const pathParts = parts.slice(uploadIndex + 2); // Skip version tag if present
        const publicIdWithExt = pathParts.join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    } catch (error) {
      console.warn('Cloudinary Delete Warning:', error.message || error);
    }
  }
};

export { cloudinary };

export default {
  cloudinary,
  cloudinaryConfig,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};
