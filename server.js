import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- DATA (draft / published) ---------------- */
const DATA_DIR = path.join(__dirname, "data");
const DRAFT_FILE = path.join(DATA_DIR, "draft.json");
const PUBLISHED_FILE = path.join(DATA_DIR, "published.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

  const defaultSite = {
    meta: { title: "Mi sitio por bloques" },
    sections: [
      {
        id: "s_banner",
        type: "bannerPro",
        props: {
          align: "left", // left|center|right
          showTitle: true,
          title: "Bienvenido",
          showSubtitle: true,
          subtitle: "Arma tu web por bloques sin tocar HTML",
          showImage: true,
          imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60",
          imageAlt: "Banner",
          overlay: true,
          showButtons: true,
          buttons: [
            { label: "Ir a servicios", href: "#servicios", variant: "primary", newTab: false },
            { label: "Contactar", href: "#contacto", variant: "ghost", newTab: false }
          ]
        }
      },
      {
        id: "s_cards",
        type: "cardsGridPro",
        props: {
          sectionId: "servicios",
          heading: "Servicios",
          subheading: "Cards en grid con columnas configurables",
          columns: "3", // 1|2|3|4
          cardStyle: "elevated", // elevated|outline|glass
          showImages: true,
          showButtons: true,
          items: [
            {
              badge: "Top",
              title: "Guardias",
              subtitle: "Servicio",
              text: "Personal capacitado, cobertura y control operativo.",
              smallText: "Respuesta rápida • 24/7",
              imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=60",
              buttonLabel: "Ver",
              buttonHref: "#"
            },
            {
              badge: "Nuevo",
              title: "Monitoreo",
              subtitle: "Tecnología",
              text: "Seguimiento y reportes con evidencia.",
              smallText: "KPIs • Dashboards",
              imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=60",
              buttonLabel: "Ver",
              buttonHref: "#"
            },
            {
              badge: "Pro",
              title: "Control",
              subtitle: "Plataforma",
              text: "Control de asistencia, incidencias y operación.",
              smallText: "Automatización • Seguridad",
              imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=60",
              buttonLabel: "Ver",
              buttonHref: "#"
            }
          ]
        }
      },
      {
        id: "s_horizontal",
        type: "cardHorizontalPro",
        props: {
          imageSide: "right", // left|right
          cardStyle: "glass", // elevated|outline|glass
          showBadge: true,
          badge: "Destacado",
          showTitle: true,
          title: "Card horizontal (imagen izquierda/derecha)",
          showSubtitle: true,
          subtitle: "Perfecta para vender un servicio con más detalle",
          showText: true,
          text: "Aquí puedes meter descripción más larga. El cliente puede invertir la imagen con un select.",
          showSmallText: true,
          smallText: "Tip: Úsala para secciones importantes",
          showImage: true,
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=60",
          imageAlt: "Horizontal",
          showButton: true,
          buttonLabel: "Acción",
          buttonHref: "#contacto",
          newTab: false
        }
      },
      {
        id: "s_feature",
        type: "cardFeaturePro",
        props: {
          sectionId: "contacto",
          align: "center", // left|center|right
          cardStyle: "elevated",
          showTitle: true,
          title: "Card grande (Feature)",
          showSubtitle: true,
          subtitle: "Para información clave, CTA fuerte y botones",
          showText: true,
          text: "Este bloque es editable completo: título, subtítulo, texto, imagen y botones.",
          showImage: false,
          imageUrl: "",
          imageAlt: "Feature",
          overlay: false,
          showButtons: true,
          buttons: [
            { label: "WhatsApp", href: "https://wa.me/5210000000000", variant: "primary", newTab: true },
            { label: "Correo", href: "mailto:contacto@tusitio.com", variant: "ghost", newTab: false }
          ]
        }
      }
    ]
  };

  if (!fs.existsSync(DRAFT_FILE)) fs.writeFileSync(DRAFT_FILE, JSON.stringify(defaultSite, null, 2));
  if (!fs.existsSync(PUBLISHED_FILE)) fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(defaultSite, null, 2));
}

ensureDataFiles();

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* ---------------- PUBLIC API ---------------- */
app.get("/api/site", (req, res) => {
  res.json(readJson(PUBLISHED_FILE));
});

/* ---------------- ADMIN API ---------------- */
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

/* ---------------- BLOCK REGISTRY ----------------
   Aquí agregas nuevos bloques y automáticamente salen en /admin */
const blockRegistry = [
  {
    type: "bannerPro",
    name: "Banner PRO",
    defaultProps: {
      align: "left",
      showTitle: true,
      title: "Título del banner",
      showSubtitle: true,
      subtitle: "Subtítulo del banner",
      showImage: true,
      imageUrl: "",
      imageAlt: "Banner",
      overlay: true,
      showButtons: true,
      buttons: [{ label: "Botón", href: "#", variant: "primary", newTab: false }]
    },
    schema: [
      { key: "align", label: "Alineación texto", input: "select", options: ["left", "center", "right"] },

      { key: "showTitle", label: "Mostrar título", input: "toggle" },
      { key: "title", label: "Título", input: "text", dependsOn: "showTitle" },

      { key: "showSubtitle", label: "Mostrar subtítulo", input: "toggle" },
      { key: "subtitle", label: "Subtítulo", input: "textarea", dependsOn: "showSubtitle" },

      { key: "showImage", label: "Mostrar imagen", input: "toggle" },
      { key: "imageUrl", label: "URL imagen", input: "text", dependsOn: "showImage" },
      { key: "imageAlt", label: "Alt imagen", input: "text", dependsOn: "showImage" },

      { key: "overlay", label: "Overlay oscuro (si hay imagen)", input: "toggle", dependsOn: "showImage" },

      { key: "showButtons", label: "Mostrar botones", input: "toggle" },
      { key: "buttons", label: "Botones", input: "buttons", dependsOn: "showButtons" }
    ]
  },

  {
    type: "cardsGridPro",
    name: "Cards Grid PRO (varias cards)",
    defaultProps: {
      sectionId: "servicios",
      heading: "Sección",
      subheading: "Descripción corta",
      columns: "3",
      cardStyle: "elevated",
      showImages: true,
      showButtons: true,
      items: [
        {
          badge: "Nuevo",
          title: "Card 1",
          subtitle: "Sub",
          text: "Descripción",
          smallText: "Texto chico",
          imageUrl: "",
          buttonLabel: "Ver",
          buttonHref: "#"
        }
      ]
    },
    schema: [
      { key: "sectionId", label: "ID de sección (para #anchor)", input: "text" },
      { key: "heading", label: "Título de sección", input: "text" },
      { key: "subheading", label: "Subtítulo de sección", input: "textarea" },

      { key: "columns", label: "Columnas", input: "select", options: ["1", "2", "3", "4"] },
      { key: "cardStyle", label: "Estilo card", input: "select", options: ["elevated", "outline", "glass"] },

      { key: "showImages", label: "Mostrar imágenes en cards", input: "toggle" },
      { key: "showButtons", label: "Mostrar botón en cards", input: "toggle" },

      { key: "items", label: "Lista de cards", input: "cardsList" }
    ]
  },

  {
    type: "cardHorizontalPro",
    name: "Card Horizontal PRO (imagen izq/der)",
    defaultProps: {
      imageSide: "right",
      cardStyle: "glass",
      showBadge: true,
      badge: "Destacado",
      showTitle: true,
      title: "Título",
      showSubtitle: true,
      subtitle: "Subtítulo",
      showText: true,
      text: "Texto largo",
      showSmallText: true,
      smallText: "Texto chico",
      showImage: true,
      imageUrl: "",
      imageAlt: "Horizontal",
      showButton: true,
      buttonLabel: "Acción",
      buttonHref: "#",
      newTab: false
    },
    schema: [
      { key: "imageSide", label: "Imagen", input: "select", options: ["left", "right"] },
      { key: "cardStyle", label: "Estilo", input: "select", options: ["elevated", "outline", "glass"] },

      { key: "showBadge", label: "Mostrar badge", input: "toggle" },
      { key: "badge", label: "Badge", input: "text", dependsOn: "showBadge" },

      { key: "showTitle", label: "Mostrar título", input: "toggle" },
      { key: "title", label: "Título", input: "text", dependsOn: "showTitle" },

      { key: "showSubtitle", label: "Mostrar subtítulo", input: "toggle" },
      { key: "subtitle", label: "Subtítulo", input: "textarea", dependsOn: "showSubtitle" },

      { key: "showText", label: "Mostrar texto", input: "toggle" },
      { key: "text", label: "Texto", input: "textarea", dependsOn: "showText" },

      { key: "showSmallText", label: "Mostrar texto chico", input: "toggle" },
      { key: "smallText", label: "Texto chico", input: "text", dependsOn: "showSmallText" },

      { key: "showImage", label: "Mostrar imagen", input: "toggle" },
      { key: "imageUrl", label: "URL imagen", input: "text", dependsOn: "showImage" },
      { key: "imageAlt", label: "Alt imagen", input: "text", dependsOn: "showImage" },

      { key: "showButton", label: "Mostrar botón", input: "toggle" },
      { key: "buttonLabel", label: "Texto botón", input: "text", dependsOn: "showButton" },
      { key: "buttonHref", label: "Href botón", input: "text", dependsOn: "showButton" },
      { key: "newTab", label: "Abrir en nueva pestaña", input: "toggle", dependsOn: "showButton" }
    ]
  },

  {
    type: "cardFeaturePro",
    name: "Card Feature PRO (grande / CTA)",
    defaultProps: {
      sectionId: "contacto",
      align: "center",
      cardStyle: "elevated",
      showTitle: true,
      title: "Título grande",
      showSubtitle: true,
      subtitle: "Subtítulo",
      showText: true,
      text: "Texto",
      showImage: false,
      imageUrl: "",
      imageAlt: "Feature",
      overlay: false,
      showButtons: true,
      buttons: [{ label: "Acción", href: "#", variant: "primary", newTab: false }]
    },
    schema: [
      { key: "sectionId", label: "ID de sección (para #anchor)", input: "text" },
      { key: "align", label: "Alineación", input: "select", options: ["left", "center", "right"] },
      { key: "cardStyle", label: "Estilo", input: "select", options: ["elevated", "outline", "glass"] },

      { key: "showTitle", label: "Mostrar título", input: "toggle" },
      { key: "title", label: "Título", input: "text", dependsOn: "showTitle" },

      { key: "showSubtitle", label: "Mostrar subtítulo", input: "toggle" },
      { key: "subtitle", label: "Subtítulo", input: "textarea", dependsOn: "showSubtitle" },

      { key: "showText", label: "Mostrar texto", input: "toggle" },
      { key: "text", label: "Texto", input: "textarea", dependsOn: "showText" },

      { key: "showImage", label: "Mostrar imagen", input: "toggle" },
      { key: "imageUrl", label: "URL imagen", input: "text", dependsOn: "showImage" },
      { key: "imageAlt", label: "Alt imagen", input: "text", dependsOn: "showImage" },
      { key: "overlay", label: "Overlay (si hay imagen)", input: "toggle", dependsOn: "showImage" },

      { key: "showButtons", label: "Mostrar botones", input: "toggle" },
      { key: "buttons", label: "Botones", input: "buttons", dependsOn: "showButtons" }
    ]
  },
  {
    type: "splitMediaPro",
    name: "Sección Imagen + Texto (Split PRO)",
    defaultProps: {
        sectionId: "promocion",
        imageSide: "left",            // left | right
        cardStyle: "clean",           // clean | glass | elevated
        roundedClip: true,            // recorte tipo “capsule”
        bg: "white",                  // white | dark
        paddingY: "lg",               // sm | md | lg

        showEyebrow: false,
        eyebrow: "NOVEDAD",

        showTitle: true,
        title: "Lleva el orgullo de México contigo",

        showSubtitle: true,
        subtitle: "Una alianza única entre ...",

        showText: true,
        text: "Texto largo opcional para explicar la campaña o el producto.",

        showImage: true,
        imageUrl: "",
        imageAlt: "Imagen",

        showButtons: true,
        buttons: [
        { label: "Conócela", href: "#", variant: "primary", newTab: false }
        ]
    },
    schema: [
        { key: "sectionId", label: "ID sección (#anchor)", input: "text" },

        { key: "imageSide", label: "Imagen a la...", input: "select", options: ["left", "right"] },
        { key: "cardStyle", label: "Estilo", input: "select", options: ["clean", "glass", "elevated"] },
        { key: "bg", label: "Fondo", input: "select", options: ["white", "dark"] },
        { key: "paddingY", label: "Espaciado vertical", input: "select", options: ["sm", "md", "lg"] },

        { key: "roundedClip", label: "Recorte redondeado (capsule)", input: "toggle" },

        { key: "showEyebrow", label: "Mostrar eyebrow", input: "toggle" },
        { key: "eyebrow", label: "Eyebrow", input: "text", dependsOn: "showEyebrow" },

        { key: "showTitle", label: "Mostrar título", input: "toggle" },
        { key: "title", label: "Título", input: "textarea", dependsOn: "showTitle" },

        { key: "showSubtitle", label: "Mostrar subtítulo", input: "toggle" },
        { key: "subtitle", label: "Subtítulo", input: "textarea", dependsOn: "showSubtitle" },

        { key: "showText", label: "Mostrar texto", input: "toggle" },
        { key: "text", label: "Texto", input: "textarea", dependsOn: "showText" },

        { key: "showImage", label: "Mostrar imagen", input: "toggle" },
        { key: "imageUrl", label: "URL imagen", input: "text", dependsOn: "showImage" },
        { key: "imageAlt", label: "Alt imagen", input: "text", dependsOn: "showImage" },

        { key: "showButtons", label: "Mostrar botones", input: "toggle" },
        { key: "buttons", label: "Botones", input: "buttons", dependsOn: "showButtons" }
    ]
  }

];

app.get("/api/admin/blocks", (req, res) => res.json(blockRegistry));

/* ---------------- Pages ---------------- */
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

/* ---------------- Start ---------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Builder corriendo en http://localhost:${PORT} | Admin: /admin`));
