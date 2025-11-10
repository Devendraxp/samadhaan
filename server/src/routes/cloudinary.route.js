import {Router} from 'express';
import {uploadsingle} from '../middlewares/cloudinary.middleware.js'

const router = Router();

router.post('/upload',uploadsingle('file'), (req,res) =>{
    return res.json({
      message: 'File uploaded',
      url: req.body.mediaLink,
      public_id: req.body.mediaPublicId,
      file: req.file,
    })
})

export default router;
