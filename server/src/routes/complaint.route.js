import { Router } from "express";
import { createComplaintController,getComplaintDetailesByIdController,getAllComplaintsController,getUserComplaintsController,updateComplaintController,deleteComplaintController} from '../controllers/complaint.controller.js'
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(authenticate,...uploadsingle("file"),createComplaintController);    //working
router.route("/").get(authenticate,getAllComplaintsController);                     //working
router.route("/me").get(authenticate,getUserComplaintsController);                  //working
router.route("/:id").get(authenticate,getComplaintDetailesByIdController);          //working
router.route("/:id").patch(authenticate,...uploadsingle("file"),updateComplaintController);   //working
router.route("/:id").delete(authenticate,deleteComplaintController);                //working

export default router;