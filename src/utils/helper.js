import { v4 as uuidv4 } from "uuid";

import { supportedMimes } from "../config/filesystem.js";

export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (!Object.keys(supportedMimes).includes(mime)) {
    return "Image must be type of png,jpg,jpeg,svg,webp,gif..";
  }
  return null;
};

// Convert bytes to megabytes
export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

// Generate a UUID
export const generateRandomNumber = () => {
  return uuidv4();
};

export const getImageUrl = (imgName) => {
  return `${process.env.APP_URL}/images/${imgName}`
};

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

// * Upload image
export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generateRandomNum() + "." + imgExt[1];
  const uploadPath = process.cwd() + "/public/images/" + imageName;
  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imageName;
};