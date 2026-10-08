import { defineField, defineType } from "sanity";

const homeGroup = "home";
const textProblem = (value: unknown, maximum: number, path = ""): string | undefined => {
  if (typeof value === "string") {
    const limit = path === "noteTemplate" ? 500 : maximum;
    if (!value.trim()) return `Completează textul „${path || "câmp"}”; nu poate conține doar spații.`;
    if (value.length > limit) return `Textul „${path || "câmp"}” depășește limita de ${limit} caractere.`;
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const issue = textProblem(item, maximum, path ? `${path}[${index + 1}]` : `[${index + 1}]`);
      if (issue) return issue;
    }
    return undefined;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "_key" || key === "_type") continue;
      const issue = textProblem(item, maximum, path ? `${path}.${key}` : key);
      if (issue) return issue;
    }
  }
  return undefined;
};

const heroStatusProblem = (value: unknown): string | true => {
  const home = value as { hero?: { stages?: unknown[] } } | null | undefined;
  const stages = home?.hero?.stages;
  if (!Array.isArray(stages) || stages.length !== 3) return true;
  for (const [index, item] of stages.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const stage = item as Record<string, unknown>;
    const hasStatus = Object.prototype.hasOwnProperty.call(stage, "status");
    if (index === 1 && (!hasStatus || typeof stage.status !== "string" || !stage.status.trim())) {
      return "Completează starea pentru a doua etapă; această stare este necesară structurii site-ului.";
    }
    if (index !== 1 && hasStatus) {
      return "Starea este disponibilă doar pentru a doua etapă. Nu reordona etapele diagramei.";
    }
  }
  return true;
};

const textItem = {
  type: "string",
  validation: (rule: import("sanity").Rule) => rule.required().max(1200).custom((value) =>
    typeof value === "string" && value.trim().length > 0 ? true : "Textul este obligatoriu și nu poate conține doar spații.",
  ),
};

const fixedLines = (name: string, title: string, count: number) =>
  defineField({
    name,
    title,
    type: "array",
    of: [textItem],
    validation: (rule) => rule.required().length(count),
    description: `Păstrează exact ${count} rânduri; macheta le așază în poziții fixe.`,
  });

const textArray = (
  name: string,
  title: string,
  count: number,
) =>
  defineField({
    name,
    title,
    type: "array",
    of: [textItem],
    validation: (rule) => rule.required().length(count),
    description: `Completează exact ${count} elemente, în ordinea afișării.`,
  });

const linkHrefValues = ["/#ce-facem", "/#cum-lucram", "/#despre-noi"];

export default defineType({
  name: "siteContent",
  title: "Conținutul site-ului",
  type: "document",
  groups: [
    { name: homeGroup, title: "Pagina principală", default: true },
    { name: "footer", title: "Subsol" },
    { name: "contactForm", title: "Formular contact" },
    { name: "seo", title: "SEO" },
    { name: "branding", title: "Identitate" },
  ],
  fields: [
    defineField({
      name: "home",
      title: "Textele paginii principale",
      type: "object",
      group: homeGroup,
      validation: (rule) => rule.required().custom((value) => textProblem(value, 1200) ?? heroStatusProblem(value)),
      description: "Editează textele în secțiunea potrivită. Numerele și linkurile secțiunilor sunt fixe.",
      fieldsets: [
        { name: "navigation", title: "Navigare", options: { collapsible: true, collapsed: false } },
        { name: "hero", title: "Hero", options: { collapsible: true, collapsed: true } },
        { name: "services", title: "Servicii", options: { collapsible: true, collapsed: true } },
        { name: "process", title: "Flux de lucru", options: { collapsible: true, collapsed: true } },
        { name: "collaboration", title: "Colaborare", options: { collapsible: true, collapsed: true } },
        { name: "about", title: "Despre noi", options: { collapsible: true, collapsed: true } },
        { name: "contact", title: "Contact", options: { collapsible: true, collapsed: true } },
      ],
      fields: [
        defineField({
          name: "navigation",
          title: "Navigare",
          type: "object",
          fieldset: "navigation",
          fields: [
            defineField({
              name: "links", title: "Linkuri meniu", type: "array", validation: (rule) => rule.required().length(3),
              description: "Păstrează cele trei destinații interne existente. Linkurile externe și scripturile nu sunt acceptate.",
              of: [{
                type: "object", name: "navigationLink", fields: [
                  defineField({ name: "label", title: "Text în meniu", type: "string", validation: (rule) => rule.required().max(40) }),
                  defineField({
                    name: "href", title: "Secțiune", type: "string",
                    options: { list: linkHrefValues.map((value) => ({ title: value, value })) },
                    validation: (rule) => rule.required().custom((value) =>
                      typeof value === "string" && linkHrefValues.includes(value)
                        ? true
                        : "Alege una dintre ancorele interne disponibile.",
                    ),
                  }),
                ],
              }],
            }),
            defineField({ name: "cta", title: "Buton meniu", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "menuOpen", title: "Accesibilitate: meniu închis", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "menuClose", title: "Accesibilitate: meniu deschis", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "menu", title: "Etichetă meniu", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "close", title: "Etichetă închidere", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "label", title: "Etichetă navigare accesibilă", type: "string", validation: (rule) => rule.required() }),
          ],
        }),
        defineField({
          name: "hero", title: "Prima secțiune · Hero", type: "object",
          fieldset: "hero",
          fields: [
            defineField({ name: "eyebrow", title: "Text deasupra titlului", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (4 rânduri)", 4),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
            defineField({ name: "primaryCta", title: "Buton principal", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "secondaryCta", title: "Buton secundar", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "support", title: "Mesaj de încredere", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "visualLabel", title: "Etichetă diagramă", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "visualStatus", title: "Stare diagramă", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "stages", title: "Etapele diagramei", type: "array", options: { sortable: false }, validation: (rule) => rule.required().length(3), of: [{ type: "object", name: "heroStage", fields: [
              defineField({ name: "label", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
              defineField({ name: "title", title: "Titlu", type: "string", validation: (rule) => rule.required() }),
              defineField({ name: "description", title: "Descriere", type: "string", validation: (rule) => rule.required() }),
              defineField({
                name: "status", title: "Stare etapă (doar etapa din mijloc)", type: "string",
                hidden: ({ document, parent }) => {
                  const stages = (document?.home as { hero?: { stages?: Array<{ _key?: string }> } } | undefined)?.hero?.stages;
                  if (!Array.isArray(stages) || !parent?._key) return true;
                  return stages.findIndex((stage) => stage?._key === parent._key) !== 1;
                },
                validation: (rule) => rule.max(1200).custom((value) =>
                  value === undefined || (typeof value === "string" && value.trim().length > 0)
                    ? true
                    : "Starea nu poate conține doar spații.",
                ),
              }),
            ] }] }),
            defineField({ name: "visualFootnote", title: "Notă sub diagramă", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "visualRange", title: "Număr etape", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "bottomLeft", title: "Text de sub secțiune (stânga)", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "bottomRight", title: "Text de sub secțiune (dreapta)", type: "string", validation: (rule) => rule.required() }),
          ],
        }),
        defineField({
          name: "servicesIntro", title: "Servicii · introducere", type: "object",
          fieldset: "services",
          fields: [
            defineField({ name: "number", title: "Număr secțiune", type: "string", readOnly: true }),
            defineField({ name: "eyebrow", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (3 rânduri)", 3),
            textArray("paragraphs", "Paragrafe (2)", 2),
            defineField({ name: "note", title: "Notă", type: "text", rows: 2, validation: (rule) => rule.required() }),
          ],
        }),
        defineField({
          name: "services", title: "Servicii · cele 5 servicii", type: "array", validation: (rule) => rule.required().length(5),
          fieldset: "services",
          description: "Păstrează exact cinci servicii; pictogramele și numerotarea sunt fixe.",
          of: [{ type: "object", name: "serviceItem", fields: [
            defineField({ name: "title", title: "Titlu", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ] }],
        }),
        defineField({
          name: "processIntro", title: "Flux de lucru · introducere", type: "object",
          fieldset: "process",
          fields: [
            defineField({ name: "number", title: "Număr secțiune", type: "string", readOnly: true }),
            defineField({ name: "eyebrow", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (2 rânduri)", 2),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
            defineField({ name: "caveatTitle", title: "Titlu notă de control", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "caveat", title: "Text notă de control", type: "text", rows: 3, validation: (rule) => rule.required() }),
            defineField({ name: "caveatLabel", title: "Etichetă control uman", type: "string", validation: (rule) => rule.required() }),
          ],
        }),
        defineField({
          name: "demonstration", title: "Flux de lucru · cele 4 etape", type: "array", validation: (rule) => rule.required().length(4),
          fieldset: "process",
          of: [{ type: "object", name: "demonstrationStep", fields: [
            defineField({ name: "title", title: "Titlu", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ] }],
        }),
        defineField({
          name: "collaborationIntro", title: "Colaborare · introducere", type: "object",
          fieldset: "collaboration",
          fields: [
            defineField({ name: "number", title: "Număr secțiune", type: "string", readOnly: true }),
            defineField({ name: "eyebrow", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (2 rânduri)", 2),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ],
        }),
        defineField({
          name: "collaboration", title: "Colaborare · cei 3 pași", type: "array", validation: (rule) => rule.required().length(3),
          fieldset: "collaboration",
          of: [{ type: "object", name: "collaborationStep", fields: [
            defineField({ name: "title", title: "Titlu", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ] }],
        }),
        defineField({
          name: "about", title: "Despre noi", type: "object",
          fieldset: "about",
          fields: [
            defineField({ name: "number", title: "Număr secțiune", type: "string", readOnly: true }),
            defineField({ name: "eyebrow", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (3 rânduri)", 3),
            textArray("paragraphs", "Paragrafe (2)", 2),
            defineField({ name: "cta", title: "Link de contact", type: "string", validation: (rule) => rule.required() }),
            textArray("sideLabels", "Etichete laterale (2)", 2),
          ],
        }),
        defineField({
          name: "contactIntro", title: "Contact · introducere", type: "object",
          fieldset: "contact",
          fields: [
            defineField({ name: "number", title: "Număr secțiune", type: "string", readOnly: true }),
            defineField({ name: "eyebrow", title: "Etichetă", type: "string", validation: (rule) => rule.required() }),
            fixedLines("title", "Titlu (2 rânduri)", 2),
            defineField({ name: "description", title: "Descriere", type: "text", rows: 3, validation: (rule) => rule.required() }),
            defineField({ name: "email", title: "Adresă de contact", type: "string", validation: (rule) => rule.required().email() }),
            defineField({ name: "note", title: "Notă", type: "text", rows: 2, validation: (rule) => rule.required() }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footer", title: "Textele din subsol", type: "object", group: "footer",
      validation: (rule) => rule.required().custom((value) => textProblem(value, 300) ?? true),
      fields: [
        defineField({ name: "slogan", title: "Slogan", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "copyright", title: "Drepturi de autor", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "location", title: "Localizare", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "backToTop", title: "Link înapoi sus", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "motto", title: "Motto", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "contactForm", title: "Textele formularului de contact", type: "object", group: "contactForm",
      validation: (rule) => rule.required().custom((value) => textProblem(value, 300) ?? true),
      fields: [
        defineField({ name: "nameLabel", title: "Etichetă nume", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "namePlaceholder", title: "Exemplu nume", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "emailLabel", title: "Etichetă e-mail", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "emailPlaceholder", title: "Exemplu e-mail", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "companyLabel", title: "Etichetă firmă", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "optionalLabel", title: "Etichetă opțional", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "companyPlaceholder", title: "Exemplu firmă", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "messageLabel", title: "Etichetă mesaj", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "messagePlaceholder", title: "Exemplu mesaj", type: "text", rows: 2, validation: (rule) => rule.required() }),
        defineField({ name: "submitLabel", title: "Buton trimitere", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "noteTemplate", title: "Notă sub formular", type: "string", description: "Folosește literalul {email}; aplicația îl înlocuiește cu adresa curentă.", validation: (rule) => rule.required().max(500).custom((value) => typeof value === "string" && value.trim().length > 0 && value.includes("{email}") ? true : "Completează nota cu literalul {email}; textul nu poate conține doar spații.") }),
        defineField({ name: "emailSubject", title: "Subiect e-mail pregătit", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "messageHeading", title: "Titlu mesaj", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "unspecifiedCompany", title: "Text firmă nespecificată", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "seo", title: "Titluri și descrieri pentru motoare de căutare", type: "object", group: "seo",
      validation: (rule) => rule.required().custom((value) => textProblem(value, 1200) ?? true),
      fields: [
        defineField({ name: "title", title: "Titlu pagină", type: "string", validation: (rule) => rule.required().max(1200) }),
        defineField({ name: "description", title: "Descriere pagină", type: "text", rows: 2, validation: (rule) => rule.required().max(1200) }),
        defineField({ name: "openGraphTitle", title: "Titlu distribuire socială", type: "string", validation: (rule) => rule.required().max(1200) }),
        defineField({ name: "openGraphDescription", title: "Descriere distribuire socială", type: "text", rows: 2, validation: (rule) => rule.required().max(1200) }),
      ],
    }),
    defineField({
      name: "branding", title: "Logo", type: "object", group: "branding",
      fields: [
        defineField({
          name: "logo", title: "Logo ȘantierSync", type: "image", options: { hotspot: true },
          description: "Încarcă PNG-ul cu sigla centrată pe fundal transparent. Pentru logo-ul existent păstrează tăierea originală.",
          fields: [
            defineField({ name: "alt", title: "Text alternativ", type: "string", validation: (rule) => rule.required().max(300).custom((value) => typeof value === "string" && value.trim().length > 0 ? true : "Textul alternativ nu poate conține doar spații.") }),
            defineField({ name: "originalCrop", title: "Folosește tăierea logo-ului original", type: "boolean", initialValue: false, description: "Activ pentru fișierul original existent. Dezactivat pentru logo-uri noi afișate cu încadrare completă." }),
          ],
          validation: (rule) => rule.required().custom(async (value, context) => {
            const assetId = value?.asset?._ref;
            if (typeof assetId !== "string") return true;
            const client = context.getClient({ apiVersion: "2026-10-08" });
            const dimensions = await client.fetch<{ width?: number; height?: number } | null>(
              "*[_id == $assetId][0].metadata.dimensions",
              { assetId },
            );
            if (!dimensions) return true;
            return dimensions.width !== undefined && dimensions.height !== undefined &&
              dimensions.width <= 10000 && dimensions.height <= 10000
              ? true
              : "Logo-ul trebuie să aibă cel mult 10.000 px pe fiecare latură.";
          }),
        }),
      ],
    }),
  ],
});
