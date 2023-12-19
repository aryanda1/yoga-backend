import { receivePayment } from "../controllers/paymentController.js";
import { Router } from "express";

const router = Router();
router.post("/", receivePayment);

export default router;
