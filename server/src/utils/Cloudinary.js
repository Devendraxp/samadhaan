import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'samadhaan_dev',  // name of folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'mp4', 'jpeg', 'webp'],
    resource_type: 'auto', // supports both image and video
  },
});

export { cloudinary, storage };
