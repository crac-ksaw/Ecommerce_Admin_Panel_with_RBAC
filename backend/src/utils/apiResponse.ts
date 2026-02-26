import { Response } from "express";

export function sendSuccess<T>(res: Response, status: number, data: T) {
  return res.status(status).json({
    success: true,
    data,
  });
}

