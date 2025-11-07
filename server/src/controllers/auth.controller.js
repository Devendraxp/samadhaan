import { loginUser, registerUser } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const register = async (req, res, next) => {
  const { email, name, password } = req.body;
  const { source } = req.query;

  if (!email) {
    throw new ApiError(400, "Email field is empty.");
  } else if (!name) {
    throw new ApiError(400, "Name field is empty.");
  } else if (!password) {
    throw new ApiError(400, "Password field is empty.");
  }
  const user = {
    email,
    name,
    password,
  };
  try {
    const data = await registerUser(user);

    const registeredUser = data.user;
    const { accessToken, refreshToken } = data;

    const options = {
      httpOnly: true,
      secure: true,
    };

    if (source == "web") {
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: registeredUser,
              accessToken,
              refreshToken,
            },
            "User registered successfully."
          )
        );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: registeredUser,
          accessToken,
          refreshToken,
        },
        "User registered successfully."
      )
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { source } = req.query;

  if (!email) {
    throw new ApiError(400, "Email field is empty.");
  } else if (!password) {
    throw new ApiError(400, "Password field is empty.");
  }
  const user = {
    email,
    password,
  };

  try {
    const data = await loginUser(user);

    const loggedInUser = data.user;
    const { accessToken, refreshToken } = data;

    const options = {
      httpOnly: true,
      secure: true,
    };

    if (source == "web") {
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken,
            },
            "User logged in successfully."
          )
        );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully."
      )
    );
  } catch (err) {
    next(err);
  }
};

export { register, login };
