require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Dummy user for demo
const user = {
  id: 1,
  username: "admin",
  password: "1234",
};

// ----------------------
// 1️⃣ Login Route - issues JWT
// ----------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    // Create a token valid for 1 hour
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ message: "Login successful", token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// ----------------------
// 2️⃣ Middleware to verify JWT
// ----------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // store user info
    next();
  });
}

// ----------------------
// 3️⃣ Protected Route
// ----------------------
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! You have access to this protected route.`,
    user: req.user,
  });
});

// ----------------------
// 4️⃣ Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
