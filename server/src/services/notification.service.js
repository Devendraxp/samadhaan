
import prisma from "../utils/Prisma.js";

const createNotification = async(notification ) =>{
    const {userId, type, title, description, domain, mediaLink} = notification;

    const createdNotification = await prisma.notification.create({
        data: {userId, type, title, description, domain, mediaLink},
    });

    return createdNotification;
}

const getNotificationById = async(id) =>{
    const fetchedNotification = await prisma.notification.findUnique({
        where: {id},
    });

    return fetchedNotification;
}

const getNotificationByDomain = async(domain) =>{
    const fetchedNotifications = await prisma.notification.findMany({
        where: {domain},
        orderBy: { createdAt: "desc"},
    });

    return fetchedNotifications;
}

const getAllNotifications = async() =>{
    const fetchedNotifications = await prisma.notification.findMany({
        where : {},
        orderBy: {createdAt: "desc"},
    });

    return fetchedNotifications;
}

const deleteNotificationById = async(notificationid) =>{
    const deletedNotification = await prisma.notification.delete({
        where: {id: notificationid},
    });

    return deletedNotification;
}

const updateNotification = async( id, data) => {
    const updatedNotification = await prisma.notification.update({
        where: {id},
        data: {...data},
    });

    return updatedNotification;
}

export {createNotification, getNotificationById, getNotificationByDomain, getAllNotifications, deleteNotificationById, updateNotification};