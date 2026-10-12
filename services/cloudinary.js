/**
 * Revé Cloudinary Media Service
 * Manages media uploads, URL resolution, and asset optimization via Cloudinary.
 */

const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "arwppqjt",
  api_key: process.env.CLOUDINARY_API_KEY || "277314149549576",
  api_secret: process.env.CLOUDINARY_API_SECRET || "JqqL2_AK1ytoV22cj3f-GaaFc8o",
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
