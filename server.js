import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- DATA ---------------- */
const DATA_DIR = path.join(__dirname, "data");
const DRAFT_FILE = path.join(DATA_DIR, "draft.json");
const PUBLISHED_FILE = path.join(DATA_DIR, "published.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

  const defaultSite = {
    meta: { title: "Mi sitio por bloques" },
    sections: []
  };

  if (!fs.existsSync(DRAFT_FILE))
    fs.writeFileSync(DRAFT_FILE, JSON.stringify(defaultSite, null, 2));

  if (!fs.existsSync(PUBLISHED_FILE))
    fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(defaultSite, null, 2));
}

ensureDataFiles();

/* ---------------- HELPERS ---------------- */
const readJson = (file) =>
  JSON.parse(fs.readFileSync(file, "utf-8"));

const writeJson = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* ---------------- PUBLIC ---------------- */
app.get("/api/site", (req, res) => {
  res.json(readJson(PUBLISHED_FILE));
});

/* ---------------- ADMIN ---------------- */
app.get("/api/admin/site", (req, res) => {
  res.json(readJson(DRAFT_FILE));
});

app.post("/api/admin/site/save", (req, res) => {
  writeJson(DRAFT_FILE, req.body);
  res.json({ ok: true });
});

app.post("/api/admin/site/publish", (req, res) => {
  writeJson(PUBLISHED_FILE, readJson(DRAFT_FILE));
  res.json({ ok: true });
});

/* ---------------- BLOCK REGISTRY ---------------- */
const blockRegistry = [
  {
    type: "banner",
    name: "Banner",
    defaultProps: {
      title: "Título",
      subtitle: "Subtítulo"
    }
  },
  {
    type: "cards",
    name: "Cards",
    defaultProps: {
      items: [{ title: "Card", text: "Texto" }]
    }
  }
];

app.get("/api/admin/blocks", (req, res) => {
  res.json(blockRegistry);
});

/* ---------------- PAGES ---------------- */
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* ---------------- START ---------------- */
app.listen(3000, () =>
  console.log("✅ Builder corriendo en http://localhost:3000")
);
