import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser, type userRoles } from "../models/user.ts";

export interface AuthRequest extends Request {
  user?: IUser;
}

// Protect routes middleware
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Role-based access
export const authorize = (roles: userRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};