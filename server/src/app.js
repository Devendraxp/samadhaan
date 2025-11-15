import express from "express";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./utils/Constant.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001',process.env.FRONTEND_URL],
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import complaintRouter from "./routes/complaint.route.js";
import responseRouter from "./routes/response.route.js";
import cloudinaryRouter from "./routes/cloudinary.route.js";
import notificationRouter from "./routes/notification.route.js";

app.use("/api/v1/notification", notificationRouter);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/complaint", complaintRouter);
app.use("/api/v1/cloudinary", cloudinaryRouter);
app.use("/api/v1/response",responseRouter);

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// it must be after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, message });
});



export default app;
