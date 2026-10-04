import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearAllProducts,
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
} from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin Protected Routes
router.delete('/clear/all', verifyToken, clearAllProducts);
router.post('/', verifyToken, upload.array('images', 10), createProduct);
router.put('/:id', verifyToken, upload.array('images', 10), updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

// Image Management Routes
router.post('/:id/images', verifyToken, upload.array('images', 10), uploadProductImages);
router.delete('/images/:id', verifyToken, deleteProductImage);
router.put('/images/:id/primary', verifyToken, setPrimaryImage);

export default router;
