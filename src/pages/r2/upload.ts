import type { APIContext } from "astro";
import exifr from "exifr";

export async function POST({ request, locals }: APIContext) {
  const { R2 } = locals.runtime.env;

  const body = await request.formData();
  const media = body.get("media") as File;
  const fileData = await media.arrayBuffer();
  const sha1 = await generateSha1(fileData);
  const exifData = await exifr.parse(fileData);
  const customMetadata = {
    sha1,
    camera: `${exifData.Make} ${exifData.Model}`,
    lens: exifData.LensModel,
    aperture: exifData.FNumber,
    shutterSpeed: `1/${Math.round(1 / exifData.ExposureTime)}s`,
    iso: exifData.ISO,
    takenAt: exifData.CreateDate.toISOString(),
    width: exifData.ExifImageWidth,
    height: exifData.ExifImageHeight,
  };

  const httpMetadata = {
    "Content-Type": media.type,
  };

  const key = sha1;
  await R2.put(key, media, { httpMetadata, customMetadata });
  return new Response(key);
}

async function generateSha1(fileData: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-1", fileData);
  const array = Array.from(new Uint8Array(digest));
  const sha1 = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return sha1;
}