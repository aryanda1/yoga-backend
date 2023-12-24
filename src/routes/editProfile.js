import { Router } from "express";
import { editProfile } from "../controllers/editProfileController.js";
import upload from "../middlewares/multerUploadMemory.js";
const router = Router();

router.put("/", upload, editProfile);

export default router;
