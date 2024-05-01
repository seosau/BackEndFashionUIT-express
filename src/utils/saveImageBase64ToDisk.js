const fs = require("fs");
const path = require("path");
const saveImageBase64ToDisk = function (
  uploadDirectory,
  base64String,
  fileName
) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");
  const imagePath = path.join(uploadDirectory, fileName);
  fs.writeFileSync(imagePath, imageBuffer);
  return imagePath;
};

module.exports = saveImageBase64ToDisk;
