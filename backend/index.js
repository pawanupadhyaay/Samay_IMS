require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const config = require("config");
const { userAuth, adminAuth } = require("./middleware/auth");
const authRouter = require("./Routers/Auth/router");
const productRouter = require("./Routers/Products/router");
const historyRouter = require("./Routers/Products/historyRoutes"); // Adjust path


const app = express();
const PORT = process.env.PORT || 5000;
console.log("Environment Variables: ", process.env);

const corsOptions = {
  origin: [
    "https://samaywatch.in",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
  ],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  exposedHeaders: ["x-auth-token"],
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  credentials: true, // ✅ Allow cookies if needed
};




if (app.get("env") === "development") {
  app.use(morgan("dev")); 
  console.log("Morgan enabled for logging");
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
// ✅ Handle Preflight Requests Manually
app.options("*", cors(corsOptions));



app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Home Route");
});

app.use("/auth", authRouter);
app.use("/products", adminAuth, productRouter);
app.use("/products/history", adminAuth, historyRouter); // Now the history route is available under `/products/history`

app.use((req, res) => {
  res.status(404).send({ error: "Route not found" });
});


mongoose
  .connect(process.env.DB_URI, )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

if (!process.env.DB_URI || !process.env.JWT_SECRET_KEY) {
  console.error("FATAL ERROR: Essential environment variables are missing");
  process.exit(1); 
}
