import type { APIContext } from "astro";
import exifr from "exifr";

export async function POST({ request, locals }: APIContext) {
  const {
    env: { R2, API_KEY },
    caches,
  } = locals.runtime;

  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.formData();
  const media = body.get("media") as File;
  if (!media) {
    return new Response("Missing media", { status: 400 });
  }
  const key = body.get("key") as string;

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
    const location = body.get("location") as string;
    let camera = `${exifData.Model}`;
    if (exifData.Make.toLowerCase() === "fujifilm") {
      camera = `${exifData.Make} ${camera}`;
    }
    customMetadata = {
      ...customMetadata,
      //  @ts-ignore
      srcset,
      src: `/r2/${key}`,
      camera,
      lens: exifData.LensModel,
      focalLengthIn35mmFormat: exifData.FocalLengthIn35mmFormat,
      timestamp: exifData.DateTimeOriginal.getTime(),
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

  const indexUrl = new URL(request.url);
  indexUrl.pathname = `/from/ben`;
  await caches.default.delete(indexUrl);

  const result = await R2.put(key, media, {
    httpMetadata,
    customMetadata,
    sha1,
  });
  console.log("result", key, result);
  return new Response(key);
}

async function generateSha1(fileData: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-1", fileData);
  const array = Array.from(new Uint8Array(digest));
  const sha1 = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return sha1;
}
