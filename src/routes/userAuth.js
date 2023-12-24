import { Router } from "express";
import {
  handleLogin,
  handleRegistration,
  handleLogout,
} from "../controllers/authController.js";
import upload from "../middlewares/multerUpload.js";
const router = Router();
console.log(upload);

router.post("/login", handleLogin);
router.post("/register", upload, handleRegistration);
router.get("/logout", handleLogout);

export default router;
