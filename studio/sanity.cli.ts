import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
if (!projectId) {
  throw new Error("Configurează SANITY_STUDIO_PROJECT_ID în studio/.env.local înainte de a rula CLI-ul.");
}

export default defineCliConfig({
  deployment: { appId: "g9tmzbgatl7rbaw15k97672f" },
  api: { projectId, dataset: process.env.SANITY_STUDIO_DATASET?.trim() || "production" },
  ...(process.env.STUDIO_HOSTNAME?.trim()
    ? { studioHost: process.env.STUDIO_HOSTNAME.trim() }
    : {}),
});
