const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const uploadRoutes = require("./routes/upload");
const sheetsRoutes = require("./routes/sheets");
const aiRoutes = require("./routes/ai");

function firstExistingPath(candidates) {
  return candidates.find((p) => fs.existsSync(p));
}

const indexFilePath = firstExistingPath([
  path.resolve(__dirname, "../index.html"),
  path.resolve(__dirname, "index.html"),
  path.resolve(process.cwd(), "index.html")
]);

const assetsDirPath = firstExistingPath([
  path.resolve(__dirname, "../assets"),
  path.resolve(__dirname, "assets"),
  path.resolve(process.cwd(), "assets")
]);

const pagesDirPath = firstExistingPath([
  path.resolve(__dirname, "../pages"),
  path.resolve(__dirname, "pages"),
  path.resolve(process.cwd(), "pages")
]);

const staticRootPath = indexFilePath ? path.dirname(indexFilePath) : null;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});

app.use("/api", uploadRoutes);
app.use("/api", sheetsRoutes);
app.use("/api/ai", aiRoutes);


// Serve static files when present (works for both local and Render directory layouts)
if (assetsDirPath) {
  app.use("/assets", express.static(assetsDirPath));
}

if (pagesDirPath) {
  app.use("/pages", express.static(pagesDirPath));
}

if (staticRootPath) {
  app.use(express.static(staticRootPath));
}

app.get("/", (req, res) => {
  if (!indexFilePath) {
    return res.status(404).json({ error: "index.html not found on server" });
  }
  res.sendFile(indexFilePath);
});

// ✅ Fallback route (NO wildcard)
app.use((req, res) => {
  if (!indexFilePath) {
    return res.status(404).json({ error: "Frontend files not found in deployment" });
  }
  res.sendFile(indexFilePath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
console.log("Resolved index file:", indexFilePath || "NOT FOUND");
