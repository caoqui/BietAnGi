import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";
import session from "express-session";
import { createConnection } from "typeorm";
import passport from "./config/passport";
import dotenv from "dotenv";
import { connectionString } from "./config/connectDB";
import redis from "./config/redis";
import http from "http";

dotenv.config();

// Create app instance
const app = express();
const port: number = parseInt(process.env.PORT as string, 10) || 5000;

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect Redis
redis
  .connect()
  .then(() => console.log("Connected to Redis."))
  .catch((error) => console.error("Error connecting to Redis:", error));

// Database Connection
createConnection(connectionString)
  .then(() => {
    console.log("Connected to the database.");

    // Set up routes
    router(app);

    // Start the server
    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.error("Error connecting to the database:", error));

// Error-handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
