import jwt from "jsonwebtoken";
import { type Response } from "express";

export const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
    algorithm: "HS512",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,        // always true since both services are on https
    sameSite: "none",    // required for cross-origin between Render services
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
};
