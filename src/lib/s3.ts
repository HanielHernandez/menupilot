import { config } from "@/lib/config";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

function requireConfigValue(name: string, value: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let client: S3Client | null = null;

export function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: requireConfigValue("R2_ENDPOINT", config.r2.endpoint),
      credentials: {
        accessKeyId: requireConfigValue(
          "R2_ACCESS_KEY_ID",
          config.r2.accessKeyId,
        ),
        secretAccessKey: requireConfigValue(
          "R2_SECRET_ACCESS_KEY",
          config.r2.secretAccessKey,
        ),
      },
      forcePathStyle: true,
    });
  }

  return client;
}

/** Permanent public object URL (no expiry). Prefers R2_PUBLIC_URL when set. */
export function getPublicObjectUrl(key: string) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const publicBase = config.r2.publicUrl.replace(/\/$/, "");
  if (publicBase) {
    return `${publicBase}/${encodedKey}`;
  }

  const endpoint = config.r2.endpoint.replace(/\/$/, "");
  const bucket = config.r2.bucket;
  return `${endpoint}/${bucket}/${encodedKey}`;
}

export async function deleteObjectFromR2(key: string) {
  if (!key) return;

  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
    }),
  );
}
