const express = require("express");
const path = require("path");

const app = express();

const uploadRoutes = require("./routes/upload");
const sheetsRoutes = require("./routes/sheets");
const aiRoutes = require("./routes/ai");

const projectRoot = path.join(__dirname, "..");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});

app.use("/api", uploadRoutes);
app.use("/api", sheetsRoutes);
app.use("/api/ai", aiRoutes);


// Serve static files
app.use("/assets", express.static(path.join(projectRoot, "assets")));
app.use("/pages", express.static(path.join(projectRoot, "pages")));
app.use(express.static(projectRoot));

app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

// ✅ Fallback route (NO wildcard)
app.use((req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
console.log("Trying to serve:", path.join(projectRoot, "index.html"));
