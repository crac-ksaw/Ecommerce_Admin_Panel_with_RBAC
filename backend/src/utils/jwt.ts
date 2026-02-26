import jwt from "jsonwebtoken";
import { HttpError } from "./httpError";

export type JwtPayload = {
  userId: number;
  role: "Admin" | "Sales";
};

export function signToken(payload: JwtPayload) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new HttpError(500, "JWT secret is not configured");
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: "8h" });
}

export function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new HttpError(500, "JWT secret is not configured");
  }
  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
