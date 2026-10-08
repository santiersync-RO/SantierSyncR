import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { defaultSiteContent } from "../src/content/site-content.ts";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
const dataset = process.env.SANITY_STUDIO_DATASET?.trim() || "production";
const token = process.env.SANITY_AUTH_TOKEN?.trim();

if (!projectId) {
  throw new Error("SANITY_STUDIO_PROJECT_ID lipsește. Configurează ID-ul proiectului Sanity real.");
}
if (!token) {
  throw new Error("SANITY_AUTH_TOKEN lipsește. Rulează scriptul prin `sanity exec --with-user-token` după autentificare.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-10-08",
  token,
  useCdn: false,
});

const documentId = "siteContent";
const existing = await client.fetch(
  "*[_id in $ids][0]._id",
  { ids: [documentId, `drafts.${documentId}`] },
  { perspective: "raw" },
);
if (existing) {
  console.info(`Documentul publicat sau draft ${documentId} există deja; seed-ul nu a făcut modificări și nu a urcat alt logo.`);
  process.exit(0);
}

const logoPath = new URL("../public/brand/logo-original.png", import.meta.url);
await access(logoPath);
const asset = await client.assets.upload("image", createReadStream(logoPath), {
  filename: "logo-original.png",
  contentType: "image/png",
});

const arrayMemberTypes = {
  "home.navigation.links": "navigationLink",
  "home.hero.stages": "heroStage",
  "home.services": "serviceItem",
  "home.demonstration": "demonstrationStep",
  "home.collaboration": "collaborationStep",
};

function addSanityKeys(value, path = "") {
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return addSanityKeys(entry, path);
      const memberType = arrayMemberTypes[path];
      if (!memberType) throw new Error(`Lipsește tipul Sanity al elementului object din ${path}.`);
      return {
        ...addSanityKeys(entry, `${path}[]`),
        _key: `${path.replaceAll(".", "-")}-${index + 1}`,
        _type: memberType,
      };
    });
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, addSanityKeys(child, path ? `${path}.${key}` : key)]),
    );
  }
  return value;
}

const content = addSanityKeys(structuredClone(defaultSiteContent));
const document = {
  ...content,
  _id: documentId,
  _type: "siteContent",
  branding: {
    ...content.branding,
    logo: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      originalCrop: true,
      alt: "Logo ȘantierSync",
    },
  },
};

await client.createIfNotExists(document);
console.info(`Creat ${documentId} în datasetul ${dataset}; logo-ul original a fost încărcat cu tăierea originală.`);
