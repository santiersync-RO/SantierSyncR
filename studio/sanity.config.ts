import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { singletonStructure } from "./src/structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
const dataset = process.env.SANITY_STUDIO_DATASET?.trim() || "production";
const previewUrl =
  process.env.PREVIEW_URL?.trim() ||
  process.env.SANITY_STUDIO_PREVIEW_URL?.trim() ||
  "https://santiersync.ro";

if (!projectId) {
  throw new Error(
    "Lipsește SANITY_STUDIO_PROJECT_ID. Creează proiectul Sanity gratuit și configurează ID-ul real în studio/.env.local.",
  );
}

export default defineConfig({
  name: "santiersync",
  title: "ȘantierSync · Conținut",
  projectId,
  dataset,
  basePath: "/",
  plugins: [
    structureTool({ structure: singletonStructure }),
    presentationTool({
      previewUrl: {
        initial: previewUrl,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
      resolve: {
        locations: {
          siteContent: {
            select: { title: "title" },
            resolve: () => ({
              locations: [{ title: "Pagina principală", href: "/" }],
            }),
          },
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => schemaType !== "siteContent"),
  },
  document: {
    actions: (previous, context) =>
      context.schemaType === "siteContent"
        ? previous.filter(({ action }) => action !== "delete" && action !== "duplicate")
        : previous,
  },
});
