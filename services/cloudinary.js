/**
 * Revé Cloudinary Media Service
 * Manages media uploads, URL resolution, and asset optimization via Cloudinary.
 * ZERO hardcoded fallbacks: strictly requires environment variables.
 */

const cloudinary = require("cloudinary").v2;
require("dotenv").config();

let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

if (process.env.CLOUDINARY_URL && (!cloudName || !apiKey || !apiSecret)) {
  const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (match) {
    apiKey = apiKey || match[1];
    apiSecret = apiSecret || match[2];
    cloudName = cloudName || match[3];
  }
}

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Missing Cloudinary credentials. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables. Zero hardcoded fallbacks allowed."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

/**
 * Upload a media file (file path or Buffer) to Cloudinary
 *
 * @param {string|Buffer} file - Local path or buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} - Upload result containing secure_url and public_id
 */
async function uploadMedia(file, options = {}) {
  const uploadOptions = {
    folder: "reve",
    resource_type: "auto",
    ...options
  };

  if (Buffer.isBuffer(file)) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(file);
    });
  }

  return cloudinary.uploader.upload(file, uploadOptions);
}

module.exports = {
  cloudinary,
  uploadMedia
};
