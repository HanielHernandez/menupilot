import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string) {
  const value = process.env[name];
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
      endpoint: requireEnv("R2_ENDPOINT"),
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
      forcePathStyle: true,
    });
  }

  return client;
}

export const R2_BUCKET = process.env.R2_BUCKET ?? "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";
export const R2_TOKEN = process.env.R2_TOKEN ?? "";
