const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("./models");

// ✅ Import Routes
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const bqRoutes = require("./routes/bq.routes");
const codeMasterRoutes = require("./routes/codeMaster.routes");
const menuRoutes = require("./routes/menu.routes");
const workflowRoutes = require("./routes/workflow.routes");
const userRoutes = require('./routes/user.routes');
const draftOrderRoutes = require("./routes/draft.routes");
const costCalculationRoutes = require('./routes/costCalculation.routes');
const productionRecordingRoutes = require('./routes/productionRecording.routes');





const app = express();
const PORT = process.env.PORT || 5055 ;

// ✅ Enhanced upload directory structure
const ensureUploadDirs = () => {
  const baseDirs = [
    'uploads',
    'uploads/temp',
    'uploads/orders',
    'uploads/drafts'
  ];
  
  baseDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

ensureUploadDirs();

// ✅ Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ENHANCED UNIFIED FILE DOWNLOAD ENDPOINT
app.get("/api/files/download/:type/:id/:filename", async (req, res) => {
  try {
    const { type, id, filename } = req.params;
    // const token = req.headers.authorization?.replace('Bearer ', '');
    
    // // Verify authentication
    // if (!token) {
    //   return res.status(401).json({ error: 'Authentication required' });
    // }

    // Validate parameters
    if (!type || !id || !filename) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let filePath;
    
    // Determine file path based on type
    if (type === 'order') {
      filePath = path.join(__dirname, 'uploads', 'orders', id, filename);
    } else if (type === 'draft') {
      filePath = path.join(__dirname, 'uploads', 'drafts', id, filename);
    } else {
      return res.status(400).json({ error: 'Invalid file type. Use "order" or "draft"' });
    }

    console.log(`🔍 Looking for file: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return res.status(404).json({ 
        error: 'File not found',
        details: `File ${filename} not found for ${type} ${id}`
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Requested path is not a file' });
    }

    // Set appropriate content type based on file extension
    const extension = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain'
    };

    const contentType = contentTypes[extension] || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // For images and PDFs, allow inline viewing
    if (['.pdf', '.jpg', '.jpeg', '.png'].includes(extension)) {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download file',
        details: error.message 
      });
    }
  }
});

// ✅ FILE VIEWING ENDPOINT (For browser preview)
app.get("/api/files/view/:type/:id/:filename", async (req, res) => {
  try {
    const { type, id, filename } = req.params;
    // const token = req.headers.authorization?.replace('Bearer ', '');
    
    // if (!token) {
    //   return res.status(401).json({ error: 'Authentication required' });
    // }

    let filePath;
    
    if (type === 'order') {
      filePath = path.join(__dirname, 'uploads', 'orders', id, filename);
    } else if (type === 'draft') {
      filePath = path.join(__dirname, 'uploads', 'drafts', id, filename);
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const extension = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };

    const contentType = contentTypes[extension] || 'application/octet-stream';
    
    // Force inline display for browser
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', contentType);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File view error:', error);
    res.status(500).json({ error: 'Failed to view file' });
  }
});

// ✅ Routes
app.use("/api", authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bq", bqRoutes);
app.use('/api/code-master', codeMasterRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/drafts", draftOrderRoutes);
app.use('/api/cost', costCalculationRoutes);
app.use("/api/production-recording", productionRecordingRoutes);


// ✅ Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// ✅ Global Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});

// ✅ Start Server
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection successful.");
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
  }
  console.log(`🚀 Server running on port : ${PORT}`);
});

module.exports = app;