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

const findUserById = async ( userId)=>{
  const user  = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id:true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

export { createUser, updateRefreshToken, getUserByEmail, findUserById };
