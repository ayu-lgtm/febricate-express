// 📁 utils/fileUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const baseDir = path.join(__dirname, "../uploads");
  const dirs = ['temp', 'orders', 'drafts'];
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  dirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

ensureUploadDirs();

// Temporary upload folder before orderId/draftId is known
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, "../uploads/temp");
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    // Keep original name with timestamp to avoid conflicts
    const safeName = `${name}-${timestamp}${ext}`;
    cb(null, safeName);
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types: Images, Documents, and Excel
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only document, Excel, and image files are allowed (JPEG, JPG, PNG, PDF, DOC, DOCX, XLS, XLSX)"
      )
    );
  }
};

// Max file size 20MB
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;