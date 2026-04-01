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

const nirnayPagePath = firstExistingPath([
  path.resolve(__dirname, "../pages/nirnay.html"),
  path.resolve(__dirname, "pages/nirnay.html"),
  path.resolve(process.cwd(), "pages/nirnay.html")
]);

const appShellPath = indexFilePath || nirnayPagePath;

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

const staticRootPath = appShellPath ? path.dirname(appShellPath) : null;

function sendFrontendUnavailablePage(res) {
  res.status(200).type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nirnay API</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f7f8fb; color: #111827; }
    .card { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
    h1 { margin: 0 0 12px; font-size: 24px; }
    p { margin: 8px 0; line-height: 1.6; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Nirnay backend is running</h1>
    <p>Frontend files were not found in this deployment artifact, so the app shell could not be served.</p>
    <p>API check: <code>/api/test</code></p>
  </div>
</body>
</html>`);
}

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
  if (!appShellPath) {
    return sendFrontendUnavailablePage(res);
  }
  res.sendFile(appShellPath);
});

// API fallback: never return HTML for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ✅ Fallback route (NO wildcard)
app.use((req, res) => {
  if (!appShellPath) {
    return sendFrontendUnavailablePage(res);
  }
  res.sendFile(appShellPath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
console.log("Resolved app shell:", appShellPath || "NOT FOUND");
