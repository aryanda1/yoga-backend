import express from "express";
import cors from "cors";
import emailRouter from "./src/routes/emailRoute.js";
import tokenRefreshRouter from "./src/routes/tokenRefresh.js";
import userAuthRouter from "./src/routes/userAuth.js";
import editProfileRouter from "./src/routes/editProfile.js";
import paymentRouter from "./src/routes/pay.js";
import jwtAuth from "./src/middlewares/jwtAuth.js";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/dbConn.js";
import { settimeout } from "./src/controllers/userBatchController.js";
const app = express();
connectDB();

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://your-production-url",
  ];
  const origin = req.headers.origin;
  console.log(origin);
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Set credentials to true
  next();
});
app.use(cookieParser());
app.use(express.json());
// app.use(e)
settimeout();
app.use("/", emailRouter);
app.use("/api/user", userAuthRouter);
app.use("/api/refresh", tokenRefreshRouter);

app.use(jwtAuth);
app.use("/api/editprofile", editProfileRouter);
app.use("/api/pay", paymentRouter);

app.listen(4001, () => console.log("Server is running on port 4001"));
