const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitizeXSS = require("./Middlewares/xssMiddleware.js");
const mongoSanitizeMiddleware = require("./Middlewares/mongoSanitizeMiddleware.js");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const qs = require("qs");
const moviesRouter = require("./Routes/moviesRoutes.js");
const authRouter = require("./Routes/authRouter.js");
const userRouter = require("./Routes/userRouter.js");
const adminRouter = require("./Routes/adminRouter.js");
const contactRouter = require("./Routes/contactRoutes.js");
const globalErrorHandler = require("./Middlewares/globalErrorHandler.js");
const AppError = require("./Utils/appError.js");

const app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
      },
    },
  })
);

let limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitizeMiddleware);
app.use(sanitizeXSS);

app.use(
  hpp({
    whitelist: ["sort", "fields", "genres", "casts"],
  })
);

app.set("query parser", (str) => qs.parse(str));

app.get("/", (req, res) => {
  res.send("Server running with secure setup");
});
// mount movies router
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/contact", contactRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
