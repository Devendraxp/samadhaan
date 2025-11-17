import express from "express";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { swaggerOptions } from "./utils/Constant.js";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: "Too many requests. Slow down and try again." });
  },
});

app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
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
const EXTERNAL_LOGO = "https://unpkg.com/tabler-icons@1.39.1/icons/shield-check.svg";

const swaggerUiOptions = {
  customSiteTitle: "Samadhaan API Docs",
  // use an externally hosted logo so the Swagger UI works even if server/public is empty
  customfavIcon: EXTERNAL_LOGO,
  customCss: `
    .swagger-ui .topbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    .swagger-ui .topbar .link {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .swagger-ui .topbar .link img {
      content: url('${EXTERNAL_LOGO}');
      width: 44px;
      height: 44px;
    }
    .swagger-ui .topbar .link span {
      font-weight: 600;
      font-size: 1.1rem;
      color: #0f172a;
      letter-spacing: 0.03em;
    }
  `,
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// it must be after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, message });
});



export default app;
