import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./utils/Constant.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import complaintRouter from "./routes/complaint.route.js"
import cloudinaryRouter from "./routes/cloudinary.route.js";
// import responseRouter from "./routes/response.routes.js";
import notificationRouter from "./routes/notification.route.js";

app.use("/api/v1/notification", notificationRouter);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/complaint",complaintRouter);
app.use("/api/v1/cloudinary",cloudinaryRouter);
// app.use("/api/v1/response",responseRouter);

const specs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// it must be after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, message });
});



export default app;
