import bcrypt from "bcryptjs";
import prisma from "../utils/Prisma.js";
import {
  createUser as createUserService,
  findUserById,
  updateUserProfile,
  deleteUserProfile,
} from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Helpers
const ensureAdmin = (req, next) => {
  const role = req.user?.role || req.user?.Role || req.user?.claims?.role;
  if (String(role).toUpperCase() !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }
  return true;
};

// Self profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const userData = await findUserById(userId);
    return res
      .status(200)
      .json(new ApiResponse(200, userData, "User profile fetched successfully."));
  } catch (err) {
    next(err);
  }
};

// Admin: list all users (basic, can add filters later)
const listUsers = async (req, res, next) => {
  try {
    const ok = ensureAdmin(req, next);
    if (ok !== true) return;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully."));
  } catch (err) {
    next(err);
  }
};

// Admin: get single user by id
const getUser = async (req, res, next) => {
  try {
    const ok = ensureAdmin(req, next);
    if (ok !== true) return;
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return next(new ApiError(404, "User not found"));
    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "User fetched successfully."));
  } catch (err) {
    next(err);
  }
};

// Admin: create user (any role)
const createUser = async (req, res, next) => {
  const ok = ensureAdmin(req, next);
  if (ok !== true) return;

  const { email, name, password, role } = req.body;
  if (!email) return next(new ApiError(400, "Email field is empty."));
  if (!name) return next(new ApiError(400, "Name field is empty."));
  if (!password) return next(new ApiError(400, "Password field is empty."));

  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return next(new ApiError(409, "Email already registered."));
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUserService({
      email,
      name,
      password: hashedPassword,
      role,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { user }, "User created successfully."));
  } catch (err) {
    next(err);
  }
};

// Self: update own profile
const updateProfile = async (req, res, next) => {
  const userId = req.user.sub;
  const { name, email, password } = req.body;
  if (name === undefined && email === undefined && password === undefined) {
    return next(new ApiError(400, "Nothing to update."));
  }
  try {
    let hashedPassword;
    if (password !== undefined) {
      if (!password) return next(new ApiError(400, "Password cannot be empty."));
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const updated = await updateUserProfile({
      id: userId,
      name,
      email,
      password: hashedPassword,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Profile updated successfully."));
  } catch (err) {
    next(err);
  }
};

// Self: delete own profile (soft)
const deleteProfile = async (req, res, next) => {
  const userId = req.user.sub;
  try {
    const deleted = await deleteUserProfile(userId);
    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Profile deleted successfully."));
  } catch (err) {
    next(err);
  }
};

// Admin: update any user
const adminUpdateUser = async (req, res, next) => {
  const ok = ensureAdmin(req, next);
  if (ok !== true) return;

  const { id } = req.params;
  const { name, email, password, role, status } = req.body;

  if (
    name === undefined &&
    email === undefined &&
    password === undefined &&
    role === undefined &&
    status === undefined
  ) {
    return next(new ApiError(400, "Nothing to update."));
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return next(new ApiError(404, "User not found"));

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (password !== undefined) {
      if (!password) return next(new ApiError(400, "Password cannot be empty."));
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updated }, "User updated successfully."));
  } catch (err) {
    if (err.code === "P2002") {
      return next(new ApiError(409, "Email already in use"));
    }
    next(err);
  }
};

// Admin: delete (soft) any user
const adminDeleteUser = async (req, res, next) => {
  const ok = ensureAdmin(req, next);
  if (ok !== true) return;

  const { id } = req.params;
  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return next(new ApiError(404, "User not found"));

    const deleted = await prisma.user.update({
      where: { id },
      data: { status: "DELETED", refreshToken: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: deleted }, "User deleted successfully."));
  } catch (err) {
    next(err);
  }
};

export {
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
};