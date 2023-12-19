import { Router } from "express";
import { sendMail } from "../controllers/contactUsController.js";

const router = Router();

router.post("/contactUs", sendMail);

export default router;
