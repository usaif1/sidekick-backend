const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initializeFirebase } = require("./src/services/firebaseAdmin");

initializeFirebase();

const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api", require("./src/routes/paymentRoutes"));
app.use("/api", require("./src/routes/userRoutes"));
app.use("/api", require("./src/routes/scooterRoutes"));
app.use("/api", require("./src/routes/paymentRoutes"));
app.use("/api", require("./src/routes/solveRoutes"));

app.get("/", (req, res) => {
  res.send("Hello from Express + Firebase Admin!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
