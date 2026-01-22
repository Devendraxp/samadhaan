import prisma from "../utils/Prisma.js";
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern, CACHE_TTL } from "../utils/redis.js";

const createNotification = async (notification) => {
  const { userId, type, title, description, domain, mediaLink } = notification;

  const createdNotification = await prisma.notification.create({
    data: { userId, type, title, description, domain, mediaLink },
  });

  await cacheSet(`notification:${createdNotification.id}`, createdNotification, CACHE_TTL.NOTIFICATION);
  await cacheDeletePattern("notifications:*");

  return createdNotification;
};

const getNotificationById = async (id) => {
  const cached = await cacheGet(`notification:${id}`);
  if (cached) return cached;

  const fetchedNotification = await prisma.notification.findUnique({
    where: { id },
  });

  if (fetchedNotification) {
    await cacheSet(`notification:${id}`, fetchedNotification, CACHE_TTL.NOTIFICATION);
  }

  return fetchedNotification;
};

const getNotificationByDomain = async (domain, { skip, size } = {}) => {
  const cacheKey = `notifications:domain:${domain}:${skip ?? 0}:${size ?? 10}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const whereClause = { domain };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
    }),
    prisma.notification.count({ where: whereClause }),
  ]);

  const result = { notifications, total };
  await cacheSet(cacheKey, result, CACHE_TTL.NOTIFICATION);

  return result;
};

const getAllNotifications = async ({ skip, size } = {}) => {
  const cacheKey = `notifications:all:${skip ?? 0}:${size ?? 10}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
    }),
    prisma.notification.count(),
  ]);

  const result = { notifications, total };
  await cacheSet(cacheKey, result, CACHE_TTL.NOTIFICATION);

  return result;
};

const deleteNotificationById = async (notificationid) => {
  const deletedNotification = await prisma.notification.delete({
    where: { id: notificationid },
  });

  await cacheDelete(`notification:${notificationid}`);
  await cacheDeletePattern("notifications:*");

  return deletedNotification;
};

const updateNotification = async (id, data) => {
  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { ...data },
  });

  await cacheDelete(`notification:${id}`);
  await cacheDeletePattern("notifications:*");

  return updatedNotification;
};

export {
  createNotification,
  getNotificationById,
  getNotificationByDomain,
  getAllNotifications,
  deleteNotificationById,
  updateNotification,
};