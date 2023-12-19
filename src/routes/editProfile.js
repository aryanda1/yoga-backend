import { Router } from "express";
import { editProfile } from "../controllers/editProfileController.js";

const router = Router();

router.put("/", editProfile);

export default router;
