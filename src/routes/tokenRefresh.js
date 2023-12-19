import { Router } from "express";
import { handleTokenRefresh } from "../controllers/tokenRefreshController.js";

const router = Router();

router.get("/", handleTokenRefresh);

export default router;
