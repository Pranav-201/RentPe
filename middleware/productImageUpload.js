import multer from "multer";

const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_PRODUCT_IMAGES,
    fileSize: MAX_IMAGE_SIZE_BYTES
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, and WebP product images are allowed"));
    }

    return callback(null, true);
  }
});

function parseImageArray(value, fieldName) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return parsed;
  } catch {
    throw new Error(`${fieldName} must be a valid image array`);
  }
}

function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.array("images", MAX_PRODUCT_IMAGES)(req.req, res.res, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

export async function uploadProductImages(req, res, next) {
  if (!req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }

  try {
    await runUpload(req, res);
    req.body = req.req.body || {};
    req.files = req.req.files || [];
    req.body.tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const existingImages = parseImageArray(req.body.existingImages, "existingImages");
    req.legacyImageSources = existingImages.filter((image) => image?.url?.startsWith("data:image/"));
    req.body.images = existingImages.filter((image) => !image?.url?.startsWith("data:image/"));
    req.remoteImageUrls = parseImageArray(req.body.remoteImageUrls, "remoteImageUrls");
    delete req.body.existingImages;
    delete req.body.remoteImageUrls;
    return next();
  } catch (error) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Each product image must be 5 MB or smaller"
      : error.message || "Product image upload failed";
    return res.badRequest({ error: message });
  }
}
