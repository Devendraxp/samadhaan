import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY_TIME = process.env.ACCESS_TOKEN_EXPIRY_TIME;
const REFRESH_TOKEN_EXPIRY_TIME = process.env.REFRESH_TOKEN_EXPIRY_TIME;

const generateAccessToken = async (user) => {
  const { id, name, email, role } = user;
  const payload = {
    sub: id,
    name,
    email,
    role,
  };
  const accessToken = await jwt.sign(payload, JWT_SECRET, {
    expiresIn: 3600,
  });

  return accessToken;
};

const generateRefreshToken = async (user) => {
  const { id, name, email, role } = user;
  const payload = {
    sub: id,
    name,
    email,
    role,
  };
  const refreshToken = await jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });

  return refreshToken;
};

export { generateAccessToken, generateRefreshToken };
