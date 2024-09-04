import Router from "express";

import authMiddleware from "../middleware/Authenticate.js";
import AuthController from "../controllers/AuthController.js";
import NewsController from "../controllers/NewsController.js";
import ProfileController from "../controllers/ProfileController.js";

const router = Router();

router.post("/auth/login", AuthController.login);
router.post("/auth/register", AuthController.register);

router.get("/profile", authMiddleware, ProfileController.index);
router.put("/profile/:id", authMiddleware, ProfileController.update);

router.get("/news", authMiddleware, NewsController.index);
router.post("/news", authMiddleware, NewsController.store);
router.get("/news/:id", authMiddleware, NewsController.show);
router.put("/news/:id", authMiddleware, NewsController.update);
router.delete("/news/:id", authMiddleware, NewsController.destroy);

export default router;
