import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
  updateRefreshToken,
} from "./user.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/RefreshTokenAndAccessToken.js";
import { ApiError } from "../utils/ApiError.js";


const SALT_ROUND = process.env.SALT_ROUND;

const registerUser = async (user) => {
  const { name, email, password } = user;

  const hashedPassword = await bcrypt.hash(password, 10);

  user = {
    name,
    email,
    password: hashedPassword,
    role: "STUDENT",
  };

  const registeredUser = await createUser(user);

  const accessToken = await generateAccessToken(registeredUser);
  const refreshToken = await generateRefreshToken(registeredUser);

  const updatedUser = await updateRefreshToken({
    id: registeredUser.id,
    refreshToken,
  });

  delete updatedUser.password;
  delete updatedUser.refreshToken;

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (user) => {
  const { email, password } = user;

  const fetchedUser = await getUserByEmail(email);
  if(!fetchedUser){
    throw new ApiError(400, `User with email: ${email} does not exist !`)
  }
  if (fetchedUser.status === "DEACTIVATED") {
    throw new ApiError(403, "Account is deactivated. Contact your administrator.");
  }
  if (fetchedUser.status === "DELETED") {
    throw new ApiError(403, "Account has been deleted. Contact your administrator.");
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    fetchedUser.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect.");
  }

  const accessToken = await generateAccessToken(fetchedUser);
  const refreshToken = await generateRefreshToken(fetchedUser);

  const updatedUser = await updateRefreshToken({
    id: fetchedUser.id,
    refreshToken,
  });

  delete updatedUser.password;
  delete updatedUser.refreshToken;

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

export { registerUser, loginUser };

