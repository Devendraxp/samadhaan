import prisma from "../utils/Prisma.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

// Accept already-hashed password (controller will hash)
const createUser = async (user) => {
  const { name, email, password, role } = user;
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password, // already hashed
      ...(role ? { role } : {}),
    },
    select: SAFE_USER_SELECT,
  });
  return createdUser;
};

const updateRefreshToken = async (data) => {
  const { id, refreshToken } = data;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { refreshToken },
    select: SAFE_USER_SELECT,
  });
  return updatedUser;
};

const getUserByEmail = async (email) => {
  // Need password for auth flows
  const user = await prisma.user.findFirst({
    where: { email },
  });
  return user;
};

const findUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });
  return user;
};

// Update profile (controller decides what fields & hashes password if provided)
const updateUserProfile = async ({ id, name, email, password }) => {
  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (password !== undefined) data.password = password; // already hashed
  const updated = await prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_SELECT,
  });
  return updated;
};

// Soft delete profile
const deleteUserProfile = async (id) => {
  const deleted = await prisma.user.update({
    where: { id },
    data: {
      status: "DELETED",
      refreshToken: null,
    },
    select: SAFE_USER_SELECT,
  });
  return deleted;
};

export {
  createUser,
  updateRefreshToken,
  getUserByEmail,
  findUserById,
  updateUserProfile,
  deleteUserProfile,
};
