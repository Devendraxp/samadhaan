import prisma from "../utils/Prisma.js";

const createUser = async (user) => {
  const { name, email, password, role } = user;

  const createdUser = await prisma.user.create({
    data: { name, email, password, role },
  });

  return createdUser;
};

const updateRefreshToken = async (data) => {
  const { id, refreshToken } = data;
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      refreshToken,
    },
  });

  return updatedUser;
};

const getUserByEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  return user;
};

export { createUser, updateRefreshToken, getUserByEmail };
