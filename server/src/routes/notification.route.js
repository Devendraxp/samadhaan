import {Router} from 'express';
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";

import { createNotificationController,getNotificationByIdController,getNotificationByDomainController,getAllNotificationsController, deleteNotificationByIdController , updateNotificationByIdController } from "../controllers/notification.controller.js";

import {authenticate} from "../middlewares/auth.middleware.js";

const router = Router();

router.route ("/").post (authenticate,...uploadsingle("file"), createNotificationController);
router.route ("/").get (authenticate,getAllNotificationsController);
router.route ("/").patch (authenticate, ...uploadsingle("file"), createNotificationController);

router.route ("/domain/:domain").get (authenticate,getNotificationByDomainController);

router.route ("/:id")
    .get (authenticate,getNotificationByIdController)
    .put (authenticate, updateNotificationByIdController)
    .delete (authenticate, deleteNotificationByIdController);

export default router;