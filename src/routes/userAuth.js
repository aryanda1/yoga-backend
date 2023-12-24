import { Router } from "express";
import {
  handleLogin,
  handleRegistration,
  handleLogout,
} from "../controllers/authController.js";
import upload from "../middlewares/multerUploadMemory.js";
const router = Router();

router.post("/login", handleLogin);
router.post("/register", upload, handleRegistration);
router.get("/logout", handleLogout);

export default router;
