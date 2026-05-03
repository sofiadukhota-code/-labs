import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller.js";
import { FeedbackRepository } from "../repositories/feedback.repository.js";

const router = Router();

router.get("/", (req, res) => res.json(FeedbackRepository.getAll()));
router.get("/resource/:resourceId", FeedbackController.getByResource);
router.get("/:id", FeedbackController.getById);
router.post("/", FeedbackController.create);
router.put("/:id", FeedbackController.update);
router.delete("/:id", FeedbackController.delete);



export default router;