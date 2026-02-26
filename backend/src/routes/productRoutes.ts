import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import {
  create,
  list,
  remove,
  update,
} from "../controllers/productController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", authenticate, asyncHandler(list));
router.post("/", authenticate, requireRole("Admin"), asyncHandler(create));
router.put("/:id", authenticate, asyncHandler(update));
router.delete("/:id", authenticate, requireRole("Admin"), asyncHandler(remove));

export default router;
