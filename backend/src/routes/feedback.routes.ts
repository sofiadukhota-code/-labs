import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller.js";

const router = Router();

router.get("/", FeedbackController.getAll);
router.get("/resource/:resourceId", FeedbackController.getByResource);
router.get("/:id", FeedbackController.getById);
router.post("/", FeedbackController.create);
router.put("/:id", FeedbackController.update);
router.delete("/:id", FeedbackController.delete);

export default router;