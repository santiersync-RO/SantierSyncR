import { homeCopy } from "./home.ro.ts";
import { z } from "zod";

type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T extends readonly (infer U)[] ? Widen<U>[] : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;

export type HomeContent = Omit<Widen<typeof homeCopy>, "navigation"> & {
  navigation: Omit<Widen<typeof homeCopy.navigation>, "links"> & { links: { label: string; href: string }[] };
};
export type SeoContent = { title: string; description: string; openGraphTitle: string; openGraphDescription: string };

export type SiteContent = {
  home: HomeContent;
  footer: { slogan: string; copyright: string; location: string; backToTop: string; motto: string };
  contactForm: {
    nameLabel: string; namePlaceholder: string; emailLabel: string; emailPlaceholder: string;
    companyLabel: string; optionalLabel: string; companyPlaceholder: string; messageLabel: string;
    messagePlaceholder: string; submitLabel: string; noteTemplate: string; emailSubject: string;
    messageHeading: string; unspecifiedCompany: string;
  };
  seo: SeoContent;
  branding: { logo: { url: string; width: number; height: number; originalCrop: boolean; alt: string } };
};

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  originalCrop?: boolean;
  alt?: string;
};

export type RawSiteContent = Omit<SiteContent, "branding"> & { branding: { logo: SanityImage } };
export type RawSiteContentSingleton = RawSiteContent & { _id: "siteContent"; _type: "siteContent" };

export const defaultSiteContent: SiteContent = {
  home: {
    ...homeCopy,
    navigation: {
      ...homeCopy.navigation,
      links: homeCopy.navigation.links.map(([label, href]) => ({ label, href })),
    },
  } as unknown as HomeContent,
  footer: {
    slogan: "Organizare pentru munca din teren.",
    copyright: "© 2026 ȘantierSync",
    location: "CLUJ · ROMÂNIA",
    backToTop: "ÎNAPOI SUS",
    motto: "OMUL RĂMÂNE LA VOLAN.",
  },
  contactForm: {
    nameLabel: "Numele tău",
    namePlaceholder: "Cum să-ți spunem?",
    emailLabel: "E-mail",
    emailPlaceholder: "nume@firma.ro",
    companyLabel: "Firmă",
    optionalLabel: "(opțional)",
    companyPlaceholder: "Numele firmei",
    messageLabel: "Cu ce te putem ajuta?",
    messagePlaceholder: "De exemplu: cum preluați și urmăriți acum cererile de ofertă?",
    submitLabel: "Deschide e-mailul pregătit",
    noteTemplate: "Butonul deschide aplicația ta de e-mail cu un mesaj pregătit către {email}. Datele nu sunt trimise sau stocate de acest site.",
    emailSubject: "Solicitare prin website — ȘantierSync",
    messageHeading: "Cu ce ne puteți ajuta?",
    unspecifiedCompany: "Nespecificată",
  },
  seo: {
    title: "ȘantierSync | Mai puțin haos. Mai multă treabă dusă la capăt.",
    description: "Ajutăm firmele de construcții și instalații să-și pună în ordine cererile de ofertă și munca administrativă — folosind instrumentele pe care le au deja.",
    openGraphTitle: "Mai puțin haos. Mai multă treabă dusă la capăt.",
    openGraphDescription: "Organizare pentru munca din teren. Cluj și împrejurimi.",
  },
  branding: {
    logo: { url: "/brand/logo-original.png", width: 1774, height: 887, originalCrop: true, alt: "ȘantierSync" },
  },
};

const boundedText = z.string().min(1).max(1200).refine((value) => value.trim().length > 0, "Text cannot be blank.");
const boundedSmallText = z.string().min(1).max(300).refine((value) => value.trim().length > 0, "Text cannot be blank.");
const navHref = z.string().regex(/^\/#(?:acasa|ce-facem|cum-functioneaza|cum-lucram|despre-noi|contact|continut)$/);

function stripSanityMetadata(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSanityMetadata);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "_key" && key !== "_type").map(([key, child]) => [key, stripSanityMetadata(child)]));
  }
  return value;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function validateAnchorFields(value: unknown, path: (string | number)[], ctx: z.RefinementCtx): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateAnchorFields(item, [...path, index], ctx));
    return;
  }
  const record = asRecord(value);
  if (!record) return;
  for (const [key, child] of Object.entries(record)) {
    if ((key === "href" || key === "target") && (typeof child !== "string" || !navHref.safeParse(child).success)) {
      ctx.addIssue({ code: "custom", path: [...path, key], message: "Links must target an existing homepage anchor." });
    } else {
      validateAnchorFields(child, [...path, key], ctx);
    }
  }
}

// Compare a CMS value to the checked-in shape so missing fields and structural
// drift fail closed while allowing editors to change the copy itself.
function sameShape(value: unknown, model: unknown): boolean {
  if (typeof model === "string") return typeof value === "string" && value.trim().length > 0 && value.length <= 1200;
  if (typeof model === "number") return typeof value === "number" && Number.isFinite(value);
  if (typeof model === "boolean") return typeof value === "boolean";
  if (Array.isArray(model)) {
    if (!Array.isArray(value) || value.length !== model.length) return false;
    if (model.length === 0) return value.every((item) => typeof item === "string");
    return value.every((item, index) => sameShape(item, model[Math.min(index, model.length - 1)]));
  }
  if (model && typeof model === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const expected = Object.keys(model);
    const actual = Object.keys(value);
    return expected.length === actual.length && expected.every((key) => key in value && sameShape((value as Record<string, unknown>)[key], (model as Record<string, unknown>)[key]));
  }
  return false;
}

const homeSchema = z.unknown().transform(stripSanityMetadata).superRefine((value, ctx) => {
  const model = defaultSiteContent.home;
  if (!sameShape(value, model)) ctx.addIssue({ code: "custom", message: "Homepage content does not match the required structure." });
  const home = asRecord(value);
  if (!home) return;
  const exactCounts: Array<[string, number]> = [["services", 5], ["demonstration", 4], ["collaboration", 3]];
  exactCounts.push(["navigation.links", 3], ["hero.stages", 3]);
  for (const [key, count] of exactCounts) {
    const path = key.split(".");
    const target = path.reduce<unknown>((current, part) => asRecord(current)?.[part], home);
    if (!Array.isArray(target) || target.length !== count) ctx.addIssue({ code: "custom", path, message: `Expected exactly ${count} items.` });
  }
  const headingCounts: Array<[string, string, number]> = [
    ["hero", "title", 4], ["servicesIntro", "title", 3], ["processIntro", "title", 2],
    ["collaborationIntro", "title", 2], ["about", "title", 3], ["contactIntro", "title", 2],
  ];
  for (const [section, field, count] of headingCounts) {
    const heading = asRecord(home[section])?.[field];
    if (!Array.isArray(heading) || heading.length !== count) ctx.addIssue({ code: "custom", path: [section, field], message: `Expected exactly ${count} heading lines.` });
  }
  const contactIntro = asRecord(home.contactIntro);
  if (typeof contactIntro?.email !== "string" || !z.email().safeParse(contactIntro.email).success) {
    ctx.addIssue({ code: "custom", path: ["contactIntro", "email"], message: "A valid contact email is required." });
  }
  validateAnchorFields(home, [], ctx);
});

const footerSchema = z.object({ slogan: boundedSmallText, copyright: boundedSmallText, location: boundedSmallText, backToTop: boundedSmallText, motto: boundedSmallText }).strict();
const contactFormSchema = z.object({
  nameLabel: boundedSmallText, namePlaceholder: boundedSmallText, emailLabel: boundedSmallText, emailPlaceholder: boundedSmallText,
  companyLabel: boundedSmallText, optionalLabel: boundedSmallText, companyPlaceholder: boundedSmallText, messageLabel: boundedSmallText,
  messagePlaceholder: boundedSmallText, submitLabel: boundedSmallText,
  noteTemplate: z.string().min(1).max(500).refine((text) => text.trim().length > 0 && text.includes("{email}"), "Keep the {email} placeholder in the note."),
  emailSubject: boundedSmallText, messageHeading: boundedSmallText, unspecifiedCompany: boundedSmallText,
}).strict();
const seoSchema = z.object({ title: boundedText, description: boundedText, openGraphTitle: boundedText, openGraphDescription: boundedText }).strict();
const brandingSchema = z.object({ logo: z.object({
  url: z.string().url().or(z.string().startsWith("/brand/logo-original.png")),
  width: z.number().int().min(1).max(10000), height: z.number().int().min(1).max(10000),
  originalCrop: z.boolean(), alt: z.string().max(300),
}).strict() }).strict();

const siteContentFields = { home: homeSchema, footer: footerSchema, contactForm: contactFormSchema, seo: seoSchema, branding: brandingSchema };
export const siteContentSchema = z.preprocess(stripSanityMetadata, z.object(siteContentFields).strict().superRefine((content, ctx) => {
  const url = content.branding.logo.url;
  if (url.startsWith("/")) {
    if (url !== "/brand/logo-original.png") ctx.addIssue({ code: "custom", path: ["branding", "logo", "url"], message: "Only the original local logo is allowed." });
    return;
  }
  let parsed: URL;
  try { parsed = new URL(url); } catch { ctx.addIssue({ code: "custom", path: ["branding", "logo", "url"], message: "Invalid logo URL." }); return; }
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  if (!projectId || !dataset || parsed.protocol !== "https:" || parsed.hostname !== "cdn.sanity.io" || pathParts.length !== 4 || pathParts[0] !== "images" || pathParts[1] !== projectId || pathParts[2] !== dataset || !/^[a-f0-9]+-[^/]+\.[a-z0-9]+$/i.test(pathParts[3] ?? "")) {
    ctx.addIssue({ code: "custom", path: ["branding", "logo", "url"], message: "Logo must be hosted in the configured Sanity project and dataset." });
  }
}));

export function parseSiteContent(value: unknown): SiteContent {
  const result = siteContentSchema.safeParse(value);
  return result.success ? result.data as SiteContent : defaultSiteContent;
}
