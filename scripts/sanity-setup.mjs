import { createClient } from "@sanity/client";
import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const secret = process.env.SANITY_WEBHOOK_SECRET;
if (!projectId || !dataset || !secret || !process.env.SANITY_AUTH_TOKEN) throw new Error("Missing setup environment; run with Sanity CLI user authentication.");
const client = createClient({ projectId, dataset, token: process.env.SANITY_AUTH_TOKEN, apiVersion: "2025-08-04", useCdn: false });
try {
  const project = await client.projects.getById(projectId);
  console.info("Project:", project.id, project.displayName);
  const url = `${new URL(process.env.SITE_URL || "https://santiersync.ro").origin}/api/sanity/revalidate`;
  const hooks = await client.request({ url: `/hooks/projects/${projectId}`, useGlobalApi: true });
  const hook = hooks.find((entry) => entry.name === "Santiersync published content");
  const body = {
    type: "document", name: "Santiersync published content", dataset, url,
    apiVersion: "v2021-03-25", httpMethod: "POST", includeDrafts: false, includeAllVersions: false,
    isDisabledByUser: false, secret,
    rule: { on: ["create", "update", "delete"], filter: '_id == "siteContent" && _type == "siteContent"', projection: '{"_id": coalesce(after()._id, before()._id), "_type": coalesce(after()._type, before()._type)}' },
  };
  if (hook) {
    await client.request({ url: `/hooks/projects/${projectId}/${hook.id}`, method: "PATCH", body, useGlobalApi: true });
    console.info("Updated published-content webhook.");
  } else {
    await client.request({ url: `/hooks/projects/${projectId}`, method: "POST", body, useGlobalApi: true });
    console.info("Created published-content webhook.");
  }
} catch (error) {
  console.error("Sanity setup failed; HTTP status:", error?.statusCode ?? "unknown");
  const message = String(error?.response?.body?.message ?? error?.response?.body?.error?.description ?? error?.message ?? "");
  console.error(message.replaceAll(secret, "[redacted]").replaceAll(process.env.SANITY_AUTH_TOKEN, "[redacted]").slice(0, 500));
  process.exitCode = 1;
}
