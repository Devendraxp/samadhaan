import { Router } from "express";
import { createResponseController,getAllResponsesController, getComplaintResponsesController } from "../controllers/response.controller.js";
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router =  Router();

router.route("/").post(authenticate,...uploadsingle("file"),createResponseController);    //working
router.route("/").get(authenticate,getAllResponsesController); 
router.route("/:id").get(authenticate,getComplaintResponsesController);

export default router;