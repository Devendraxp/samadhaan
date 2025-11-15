import prisma from "../utils/Prisma.js";
import { ApiError } from "../utils/ApiError.js";

const STAFF_ROLES = ["MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];

const loadCurrentUser = async (req) => {
  if (req.currentUser) {
    return req.currentUser;
  }

  const userId = req.user?.sub;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.currentUser = user;
  return user;
};

const ensureAccountNotDisabled = async (req, res, next) => {
  try {
    const user = await loadCurrentUser(req);
    if (user.status === "DEACTIVATED") {
      return next(new ApiError(403, "Account is deactivated. Contact your administrator."));
    }
    if (user.status === "DELETED") {
      return next(new ApiError(403, "Account has been deleted. Contact your administrator."));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const ensureWritableAccount = async (req, res, next) => {
  try {
    const user = await loadCurrentUser(req);
    if (user.status === "VIEW_ONLY") {
      return next(new ApiError(403, "View-only accounts cannot perform this action."));
    }
    if (user.status === "DEACTIVATED") {
      return next(new ApiError(403, "Account is deactivated. Contact your administrator."));
    }
    if (user.status === "DELETED") {
      return next(new ApiError(403, "Account has been deleted. Contact your administrator."));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await loadCurrentUser(req);
      if (user.status === "DEACTIVATED") {
        return next(new ApiError(403, "Account is deactivated. Contact your administrator."));
      }
      if (user.status === "DELETED") {
        return next(new ApiError(403, "Account has been deleted. Contact your administrator."));
      }
      if (!allowedRoles.includes(user.role)) {
        return next(new ApiError(403, "You are not authorized to access this resource."));
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

const requireStaffOrAdmin = authorizeRoles("ADMIN", ...STAFF_ROLES);

export {
  STAFF_ROLES,
  loadCurrentUser,
  ensureAccountNotDisabled,
  ensureWritableAccount,
  authorizeRoles,
  requireStaffOrAdmin,
};
