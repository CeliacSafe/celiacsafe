import { z } from 'zod';

function normalizeWebsite(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  let url = value.trim();
  if (/^www\./i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

const optionalWebsite = z
  .string()
  .optional()
  .transform((value) => normalizeWebsite(value))
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: 'invalid_website',
  });

/** Client- und API-Validierung für Restaurant-Vorschläge (Spiegel der RLS-Checks). */
export const submissionDataSchema = z.object({
  restaurantName: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  countryCode: z.enum(['ES', 'DE']).optional(),
  address: z.string().trim().max(500).optional(),
  website: optionalWebsite,
  contactInfo: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
  submitterName: z.string().trim().max(120).optional(),
  submitterEmail: z
    .string()
    .trim()
    .max(254)
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'invalid_email',
    })
    .optional(),
});

export type ValidatedSubmissionData = z.infer<typeof submissionDataSchema>;

export function parseSubmissionData(data: {
  restaurantName: string;
  city: string;
  countryCode?: 'ES' | 'DE';
  address?: string;
  website?: string;
  contactInfo?: string;
  notes?: string;
  submitterName?: string;
  submitterEmail?: string;
}): ValidatedSubmissionData | null {
  const result = submissionDataSchema.safeParse(data);
  return result.success ? result.data : null;
}
