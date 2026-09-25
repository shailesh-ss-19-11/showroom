import crypto from "node:crypto";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.GARAGE_BUCKET || "bike-photos";

const s3 = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT || "http://localhost:3900",
  region: process.env.GARAGE_REGION || "garage",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY,
  },
});

export function generateKey(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

export async function uploadObject(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

export async function getObject(key) {
  return s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function checkBucketHealth() {
  await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
}

/** Extracts the storage key from a full "/uploads/<key>" or absolute URL. */
export function keyFromUrl(url) {
  if (!url) return null;
  const withoutQuery = url.split("?")[0];
  const marker = "/uploads/";
  const idx = withoutQuery.indexOf(marker);
  return idx === -1 ? null : withoutQuery.slice(idx + marker.length);
}
