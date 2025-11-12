import { Router } from "express";
import {
  // self
  getProfile,
  updateProfile,
  deleteProfile,
  // admin
  listUsers,
  getUser,
  createUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Self profile
router
  .route("/profile")
  .get(authenticate, getProfile)
  .patch(authenticate, updateProfile)
  .delete(authenticate, deleteProfile);

// Admin user management
router
  .route("/")
  .get(authenticate, listUsers)   // list all users (admin check inside controller)
  .post(authenticate, createUser); // create user (admin)

// Single user admin ops (place after /profile to avoid clash)
router
  .route("/:id")
  .get(authenticate, getUser)
  .patch(authenticate, adminUpdateUser)
  .delete(authenticate, adminDeleteUser);

export default router;