import express from 'express';
  import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';

  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  router.post('/', authenticateToken, upload.single('file'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
  });

  export default router;