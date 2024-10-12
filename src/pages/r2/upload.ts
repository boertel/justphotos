import type { APIContext } from "astro";
import exifr from "exifr";

export async function POST({ request, locals }: APIContext) {
  const { R2, API_KEY } = locals.runtime.env;

  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.formData();
  const media = body.get("media") as File;
  const key = body.get("key") as string;
  const location = body.get("location") as string;

  const fileData = await media.arrayBuffer();

  const sha1 = await generateSha1(fileData);

  let customMetadata = {
    contentType: media.type,
    sha1,
    id: sha1,
    key,
  };

  if (media.type === "image/jpeg") {
    const exifData = await exifr.parse(fileData);
    const srcset = body.get("srcset") as string;
    customMetadata = {
      //  @ts-ignore
      srcset,
      src: `/r2/${key}`,
      camera: `${exifData.Model}`,
      lens: exifData.LensModel || `${exifData.FocalLengthIn35mmFormat}mm`,
      aperture: isNaN(exifData.FNumber) ? undefined : exifData.FNumber,
      shutterSpeed: exifData.ExposureTime
        ? `1/${Math.round(1 / exifData.ExposureTime)}s`
        : undefined,
      iso: exifData.ISO,
      exposureCompensation: exifData.ExposureCompensation,
      takenAt: exifData.CreateDate.toISOString(),
      width: exifData.ExifImageWidth,
      height: exifData.ExifImageHeight,
      location: location ? location : undefined,
    };

    for (const key in customMetadata) {
      if (customMetadata[key] === undefined) {
        delete customMetadata[key];
      }
    }
  }

  const httpMetadata = {
    "Content-Type": media.type,
  };

  await R2.put(key, media, { httpMetadata, customMetadata, sha1 });
  return new Response(key);
}

async function generateSha1(fileData: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-1", fileData);
  const array = Array.from(new Uint8Array(digest));
  const sha1 = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return sha1;
}
