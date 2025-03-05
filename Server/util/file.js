const path = require('path')
const fs = require('fs')

// Function to delete an image from the filesystem
const clearImage = (filePath) => {
  const projectRoot = path.resolve(__dirname, '..');
  const fullPath = path.resolve(projectRoot, filePath);
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error(`Failed to delete image at ${fullPath}:`, err);
    } 
  });
};

exports.clearImage = clearImage;