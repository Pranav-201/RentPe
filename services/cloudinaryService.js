import { v2 as cloudinary } from "cloudinary";

const requiredEnvironmentVariables = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

function getCloudinary() {
  const missing = requiredEnvironmentVariables.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Cloudinary is not configured. Missing: ${missing.join(", ")}`);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  return cloudinary;
}

export async function uploadProductImage(source) {
  const client = getCloudinary();

  const result = await client.uploader.upload(source, {
    folder: "rentpe/products",
    resource_type: "image"
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary did not return a secure image URL");
  }

  return result.secure_url;
}

export function uploadProductImageBuffer(buffer) {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder: "rentpe/products", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error("Cloudinary did not return a secure image URL"));
        return resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}
