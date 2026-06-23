import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(trackId: string, fileExtension: string) {
  const objectKey = `raw/${trackId}.${fileExtension}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: "audio/wav",
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return { uploadUrl: signedUrl, objectKey };
}