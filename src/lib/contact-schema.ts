import { z } from "zod";

const cleanText = (max: number) => z.string().trim().min(1).max(max)
  .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value));

export const contactSchema = z.object({
  name: cleanText(120),
  email: z.string().trim().min(1).max(254).email(),
  company: z.string().trim().max(120).default(""),
  message: cleanText(1500),
}).strict();

export type ContactInput = z.infer<typeof contactSchema>;
