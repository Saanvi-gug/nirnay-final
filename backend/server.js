const express = require("express");
const path = require("path");

const app = express();

// API routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "../pages")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Default route (index.html)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
