import { z } from 'zod';

export const trackUploadUrlSchema = z.object({
  trackId: z.string().uuid(),
  fileExtension: z.string().min(1).max(10),
});

export const registerTrackSchema = z.object({
  artistId: z.string().uuid(),
  title: z.string().min(1).max(255),
  durationSeconds: z.number().int().positive(),
  fileUrlHls: z.string().url(),
  fileUrlRaw: z.string().url(),
  genre: z.string().max(100).optional(),
  bpm: z.number().int().positive().optional(),
  keySignature: z.string().max(10).optional(),
  isrcCode: z.string().max(15).optional(),
  splits: z.array(z.object({
    rightsHolderId: z.string().uuid(),
    splitPercentage: z.number().min(0).max(100),
    role: z.string(),
  })).min(1),
});

export const paymentOnboardSchema = z.object({
  artistId: z.string().uuid(),
  email: z.string().email(),
});

export const paymentPurchaseSchema = z.object({
  listenerId: z.string().uuid(),
  artistConnectId: z.string(),
  amountInCents: z.number().int().positive(),
});

export const tipSchema = z.object({
  recipientArtistId: z.string().uuid(),
  amountCents: z.number().int().positive().min(100),
  message: z.string().max(500).optional(),
});
