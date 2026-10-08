import { z } from "zod";

export const contactSchema = z
  .object({
    company: z.string().trim().min(1, "Completează denumirea firmei.").max(120, "Denumirea firmei poate avea cel mult 120 de caractere."),
    email: z.string().trim().min(1, "Introdu o adresă de email validă.").max(254, "Introdu o adresă de email validă.").email("Introdu o adresă de email validă."),
    message: z.string().trim().min(20, "Descrie procesul în 20–1.500 de caractere.").max(1500, "Descrie procesul în 20–1.500 de caractere."),
    name: z.string().trim().max(80, "Numele poate avea cel mult 80 de caractere.").optional().default(""),
    phone: z.string().trim().max(30, "Telefonul poate avea cel mult 30 de caractere.").optional().default(""),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;

export const contactFieldErrors: Record<string, string> = {
  company: "Completează denumirea firmei.",
  email: "Introdu o adresă de email validă.",
  message: "Descrie procesul în 20–1.500 de caractere.",
  name: "Numele poate avea cel mult 80 de caractere.",
  phone: "Telefonul poate avea cel mult 30 de caractere.",
};
