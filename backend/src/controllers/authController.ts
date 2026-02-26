import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { loginSchema } from "../validators/auth";
import { HttpError } from "../utils/httpError";
import { sendSuccess } from "../utils/apiResponse";

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { role: true },
  });

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signToken({ userId: user.id, role: user.role.name as "Admin" | "Sales" });

  return sendSuccess(res, 200, {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
    },
  });
}
