import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movieRoutes";
import adminRoutes from "./routes/adminRoutes";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
// Load environment variables
dotenv.config();
import "./utils/db"

//to create index
// movieModel.createIndexes().then(() => console.log("Indexes created successfully"));


const app = express();

// CORS configuration - Only allow specific origins
const allowedOrigins = [
  'http://localhost:3000', // Local development
];

const corsOptions = {
  origin: (origin: string |undefined, callback: Function) => {
    if(!origin || origin =='http://localhost:3000'){
      callback(null,true)
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Apply JSON parsing middleware
app.use(express.json());

// Apply rate limiting middleware (e.g., 100 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit to 100 requests per IP
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Movie API",
      version: "1.0.0",
      description: "API for managing movies",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000/api",
      },
    ],
  },
  apis: ["./routes/*.ts"], // Path to your API documentation comments (Swagger annotations)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Use Swagger UI to serve the API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Movie routes
app.use("/api", movieRoutes);
app.use("/admin", adminRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.send("OK HEALTH!");
});

export default app;
