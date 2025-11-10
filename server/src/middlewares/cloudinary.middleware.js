import multer from "multer";
import { storage,cloudinary } from "../utils/Cloudinary.js";

const upload = multer({ storage ,limits: { fileSize: 10 * 1024 * 1024 }});

const  uploadsingle = (fieldname) => [
    upload.single(fieldname), 
        (req,res,next) =>{
            if(!req.file) {
                console.log("file is not provided");
                return next();
            }
            req.body.mediaLink = req.file?.path??  req.file?.secure_url ?? req.file?.url ?? null;
            req.body.mediaPublicId = req.file?.public_id ?? req.file?.filename ?? null;
            return next();
        }
    ]

export {uploadsingle};



