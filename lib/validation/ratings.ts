import { z } from "zod";

export const createRatingSchema = z.object({
  runId: z.coerce.number().int().positive("Neispravan trening."),
  score: z.coerce.number().int().min(1, "Ocena mora biti od 1 do 5.").max(5, "Ocena mora biti od 1 do 5."),
  comment: z
    .string()
    .trim()
    .min(1, "Komentar je obavezan.")
    .max(1000, "Komentar moze imati najvise 1000 karaktera."),
});

export const updateRatingSchema = z.object({
  score: z.coerce.number().int().min(1, "Ocena mora biti od 1 do 5.").max(5, "Ocena mora biti od 1 do 5."),
  comment: z
    .string()
    .trim()
    .min(1, "Komentar je obavezan.")
    .max(1000, "Komentar moze imati najvise 1000 karaktera."),
});
