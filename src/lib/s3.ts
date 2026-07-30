import { config } from "@/lib/config";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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

export async function uploadObjectToR2(input: {
  key: string;
  body: Buffer;
  contentType?: string;
}) {
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return getPublicObjectUrl(input.key);
}

/** Read object metadata from Cloudflare R2 after upload. */
export async function headObjectFromR2(key: string) {
  const s3 = getS3Client();
  const result = await s3.send(
    new HeadObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
    }),
  );

  return {
    size: typeof result.ContentLength === "number" ? result.ContentLength : null,
    contentType: result.ContentType ?? null,
  };
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
