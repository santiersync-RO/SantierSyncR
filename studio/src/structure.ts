import type { StructureResolver } from "sanity/structure";

export const singletonStructure: StructureResolver = (S) =>
  S.list()
    .title("Conținut site")
    .items([
      S.listItem()
        .id("siteContent")
        .title("Pagina principală")
        .child(
          S.document()
            .schemaType("siteContent")
            .documentId("siteContent")
            .title("Conținutul site-ului"),
        ),
    ]);
