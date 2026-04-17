import express from 'express';
import multer from 'multer';
import { listProducts, addProduct, removeProduct, singleProduct, updateBestseller } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import { validateProduct } from '../middleware/validation.js';

const productRouter = express.Router();

const productImageUpload = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 },
  { name: 'image9', maxCount: 1 },
  { name: 'image10', maxCount: 1 },
]);

const handleProductUpload = (req, res, next) => {
  productImageUpload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must be 5MB or smaller' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
  });
};

productRouter.post('/add', adminAuth, handleProductUpload, validateProduct, addProduct);
productRouter.post('/remove', adminAuth,removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.post('/update-bestseller', adminAuth, updateBestseller);


export default productRouter;



