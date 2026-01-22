import prisma from "../utils/Prisma.js";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  CACHE_TTL,
} from "../utils/redis.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const createUser = async (user) => {
  const { name, email, password, role } = user;
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
      ...(role ? { role } : {}),
    },
    select: SAFE_USER_SELECT,
  });

  // Cache the new user
  await cacheSet(`user:${createdUser.id}`, createdUser, CACHE_TTL.USER);
  await cacheDeletePattern("users:list:*");

  return createdUser;
};

const updateRefreshToken = async (data) => {
  const { id, refreshToken } = data;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { refreshToken },
    select: SAFE_USER_SELECT,
  });

  await cacheSet(`user:${id}`, updatedUser, CACHE_TTL.USER);

  return updatedUser;
};

const getUserByEmail = async (email) => {
  // Check cache first
  const cached = await cacheGet(`user:email:${email}`);
  if (cached) return cached;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) {
    await cacheSet(`user:email:${email}`, user, CACHE_TTL.USER);
  }

  return user;
};

const findUserById = async (userId) => {
  // Check cache first
  const cached = await cacheGet(`user:${userId}`);
  if (cached) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (user) {
    await cacheSet(`user:${userId}`, user, CACHE_TTL.USER);
  }

  return user;
};

const updateUserProfile = async ({ id, name, email, password }) => {
  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (password !== undefined) data.password = password;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_SELECT,
  });

  await cacheDelete(`user:${id}`);
  await cacheDeletePattern(`user:email:*`);
  await cacheDeletePattern("users:list:*");

  return updated;
};

const deleteUserProfile = async (id) => {
  const deleted = await prisma.user.update({
    where: { id },
    data: {
      status: "DELETED",
      refreshToken: null,
    },
    select: SAFE_USER_SELECT,
  });

  await cacheDelete(`user:${id}`);
  await cacheDeletePattern(`user:email:*`);
  await cacheDeletePattern("users:list:*");

  return deleted;
};

const listAllUsers = async ({ skip, size }) => {
  const cacheKey = `users:list:${skip}:${size}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: size,
    }),
    prisma.user.count(),
  ]);

  const result = { users, total };
  await cacheSet(cacheKey, result, CACHE_TTL.USER);

  return result;
};

export {
  createUser,
  updateRefreshToken,
  getUserByEmail,
  findUserById,
  updateUserProfile,
  deleteUserProfile,
  listAllUsers,
};
