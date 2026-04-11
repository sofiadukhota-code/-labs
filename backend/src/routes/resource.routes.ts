import { Router } from "express";
import { ResourceController } from "../controllers/resource.controller.js";

const router = Router();
router.get("/", ResourceController.getAll);
router.get("/:id", ResourceController.getById);
router.post("/", ResourceController.create);
router.put("/:id", ResourceController.update)
router.patch("/:id", ResourceController.patch);
export default router;

router.delete("/:id", ResourceController.delete)