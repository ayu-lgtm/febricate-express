const fs = require("fs");
const path = require("path");
const orderService = require("../services/orderService");
const { generateOrderId } = require("../utils/generateOrderId");
const { getUserFromToken } = require("../services/authServices");

// 🌐 POST create new production order
exports.createOrder = async (req, res) => {
  let drawingPath = "", poCopyPath = "";
  let tempFiles = [];
  
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });
    
    const user = await getUserFromToken(authToken);
    const { spcName, freightMaintained } = req.body;
    
    if (!spcName) return res.status(400).json({ error: "spcName is required." });
    if (freightMaintained === undefined || freightMaintained === null || freightMaintained === "")
      return res.status(400).json({ error: "freight status is required." });

    const [plantCode] = spcName.split("-");
    const orderId = await generateOrderId(plantCode);
    
    const requiredFields = [
      "spcName", "customerName", "meshType", "weldmeshQty", "unit",
      "dispatchLocation", "orderType", "rmType", "deliveryDate", "freightMaintained", "application"
    ];
    
    for (const f of requiredFields) {
      if (!req.body[f]) {
        return res.status(400).json({ error: `${f} is required.` });
      }
    }

    const freightMaintain = Boolean(
      freightMaintained === "Yes" || freightMaintained === true || freightMaintained === 1
    );

    // ✅ Enhanced file handling
    const targetDir = path.join(__dirname, "../uploads/orders", orderId);
    fs.mkdirSync(targetDir, { recursive: true });

    const fileUpdates = {};

    // Process Drawing file
    if (req.files?.drawing?.[0]) {
      const drawingFile = req.files.drawing[0];
      const originalName = drawingFile.originalname;
      const ext = path.extname(originalName);
      const fileName = `drawing_${Date.now()}${ext}`;
      
      drawingPath = path.join(targetDir, fileName);
      fs.renameSync(drawingFile.path, drawingPath);
      tempFiles.push(drawingFile.path);
      
      fileUpdates.PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH = `orders/${orderId}/${fileName}`;
      fileUpdates.PRODUCTION_ORDER_DRAWING_ATTACHMENT_NAME = originalName;
    } else {
      return res.status(400).json({ error: "Drawing file is required" });
    }

    // Process PO Copy file
    if (req.files?.poCopy?.[0]) {
      const poFile = req.files.poCopy[0];
      const originalName = poFile.originalname;
      const ext = path.extname(originalName);
      const fileName = `pocopy_${Date.now()}${ext}`;
      
      poCopyPath = path.join(targetDir, fileName);
      fs.renameSync(poFile.path, poCopyPath);
      tempFiles.push(poFile.path);
      
      fileUpdates.PRODUCTION_ORDER_PO_ATTACHMENT_PATH = `orders/${orderId}/${fileName}`;
      fileUpdates.PRODUCTION_ORDER_PO_ATTACHMENT_NAME = originalName;
    } else {
      return res.status(400).json({ error: "PO Copy file is required" });
    }

    // Map request body to DB fields
    const orderData = {
      PRODUCTION_ORDER_ID: orderId,
      PRODUCTION_ORDER_REQUESTOR_ID: user.userID,
      PRODUCTION_ORDER_SPC_NAME: req.body.spcName,
      PRODUCTION_ORDER_CITY_CODE: req.body.cityCode,
      PRODUCTION_ORDER_VEHICLE_TYPE: req.body.vehicleType,
      PRODUCTION_ORDER_CUSTOMER_NAME: req.body.customerName,
      PRODUCTION_ORDER_APPLICATION: req.body.application,
      PRODUCTION_ORDER_MESH_TYPE: req.body.meshType,
      PRODUCTION_ORDER_WELDMESH_QTY: parseFloat(req.body.weldmeshQty),
      PRODUCTION_ORDER_UNIT: req.body.unit,
      PRODUCTION_ORDER_WELDMESH_DETAILS: req.body.weldmeshDetails,
      PRODUCTION_ORDER_DISPATCH_LOCATION: req.body.dispatchLocation,
      PRODUCTION_ORDER_ORDER_TYPE: req.body.orderType,
      PRODUCTION_ORDER_RM_MATERIAL_NO: req.body.rmMaterialNo,
      PRODUCTION_ORDER_RM_TYPE: req.body.rmType,
      PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION: req.body.rmMaterialDescription,
      PRODUCTION_ORDER_FG_MATERIAL_NUMBER: req.body.fgMaterialNumber,
      PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION: req.body.fgMaterialDescription,
      PRODUCTION_ORDER_FREIGHT_MAINTAINED: freightMaintain,
      PRODUCTION_ORDER_FREIGHT_PO_NUMBER: freightMaintain ? req.body.freightPoNumber : null,
      PRODUCTION_ORDER_FREIGHT_STD_RATE: freightMaintain ? parseFloat(req.body.freightStdRate) : null,
      PRODUCTION_ORDER_REMARKS: req.body.remarks,
      PRODUCTION_ORDER_DELIVERY_DATE: new Date(req.body.deliveryDate),
      PRODUCTION_ORDER_STATUS: "Pending with SPC Manager",
      PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL: 1,
      PRODUCTION_ORDER_FINAL_STATUS: null,
      ...fileUpdates
    };

    const newOrder = await orderService.createOrder(orderData, user.userID);
    
    // Cleanup temp files
    tempFiles.forEach(tempFile => {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          console.error("Temp file cleanup error:", e.message);
        }
      }
    });

    return res.status(201).json({ success: true, data: newOrder });
    
  } catch (err) {
    console.error("❌ Order creation error:", err.message);
    
    // Cleanup on error
    try {
      if (drawingPath && fs.existsSync(drawingPath)) fs.unlinkSync(drawingPath);
      if (poCopyPath && fs.existsSync(poCopyPath)) fs.unlinkSync(poCopyPath);
      tempFiles.forEach(tempFile => {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      });
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
    
    return res.status(400).json({ 
      error: "Failed to create order", 
      details: err.message 
    });
  }
};

// 🌐 PUT update existing order
exports.updateOrder = async (req, res) => {
  let drawingPath = "", poCopyPath = "";
  let tempFiles = [];
  
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });
    
    const user = await getUserFromToken(authToken);
    const { orderId } = req.params;
    
    const existing = await orderService.getOrderById(orderId);
    if (!existing) return res.status(404).json({ error: "Order not found" });

    // Check if user can edit this order
    const canEdit = await orderService.canUserEditOrder(orderId, user.userID, user.role);
    
    if (!canEdit) {
      return res.status(403).json({
        error: "Update not allowed. Order cannot be edited in current status."
      });
    }

    // Ensure order folder exists
    const targetDir = path.join(__dirname, "../uploads/orders", orderId);
    fs.mkdirSync(targetDir, { recursive: true });

    const fileUpdates = {};

    // Handle file uploads - only update if new files are provided
    if (req.files?.drawing?.[0]) {
      const drawingFile = req.files.drawing[0];
      const originalName = drawingFile.originalname;
      const ext = path.extname(originalName);
      const fileName = `drawing_${Date.now()}${ext}`;
      
      drawingPath = path.join(targetDir, fileName);
      fs.renameSync(drawingFile.path, drawingPath);
      tempFiles.push(drawingFile.path);
      
      fileUpdates.PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH = `orders/${orderId}/${fileName}`;
      fileUpdates.PRODUCTION_ORDER_DRAWING_ATTACHMENT_NAME = originalName;
    }

    if (req.files?.poCopy?.[0]) {
      const poFile = req.files.poCopy[0];
      const originalName = poFile.originalname;
      const ext = path.extname(originalName);
      const fileName = `pocopy_${Date.now()}${ext}`;
      
      poCopyPath = path.join(targetDir, fileName);
      fs.renameSync(poFile.path, poCopyPath);
      tempFiles.push(poFile.path);
      
      fileUpdates.PRODUCTION_ORDER_PO_ATTACHMENT_PATH = `orders/${orderId}/${fileName}`;
      fileUpdates.PRODUCTION_ORDER_PO_ATTACHMENT_NAME = originalName;
    }

    // Build update object
    const updateData = {
      ...req.body,
      PRODUCTION_ORDER_STATUS: "Pending with SPC Manager",
      PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL: 1,
      PRODUCTION_ORDER_FINAL_STATUS: null,
      ...fileUpdates
    };

    const updated = await orderService.updateOrder(orderId, updateData, user.userID);
    
    // Cleanup temp files
    tempFiles.forEach(tempFile => {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          console.error("Temp file cleanup error:", e.message);
        }
      }
    });

    return res.status(200).json({ success: true, data: updated });
    
  } catch (err) {
    console.error("❌ Order update error:", err.message);
    
    // Cleanup on error
    try {
      if (drawingPath && fs.existsSync(drawingPath)) fs.unlinkSync(drawingPath);
      if (poCopyPath && fs.existsSync(poCopyPath)) fs.unlinkSync(poCopyPath);
      tempFiles.forEach(tempFile => {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      });
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
    
    return res.status(400).json({ 
      error: "Failed to update order", 
      details: err.message 
    });
  }
};

// Add this new method to check edit permissions
exports.canEditOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const authToken = req.headers['authorization']?.split(' ')[1];
    
    if (!authToken) return res.status(400).json({ error: "authToken required" });
    
    const user = await getUserFromToken(authToken);
    const canEdit = await orderService.canUserEditOrder(orderId, user.userID, user.role);
    
    return res.status(200).json({ 
      success: true, 
      data: { canEdit } 
    });
  } catch (err) {
    console.error("❌ Error checking edit permission:", err.message);
    return res.status(500).json({ error: "Failed to check edit permission" });
  }
};



// 🌐 GET order by ID with edit permission check
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ error: "orderId is required" });

    const authToken = req.headers['authorization']?.split(' ')[1];
    const user = authToken ? await getUserFromToken(authToken) : null;

    const order = await orderService.getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Check if user can edit this order
    let canEdit = false;
    if (user) {
      canEdit = await orderService.canUserEditOrder(orderId, user.userID, user.role);
    }

    return res.status(200).json({ 
      success: true, 
      data: order,
      permissions: { canEdit }
    });
  } catch (err) {
    console.error("❌ Error fetching order details:", err.message);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
};

// 🌐 GET all production orders with filters + pagination
exports.getAllOrders = async (req, res) => {
  try {
    // Extract query params
    const { status, spcName, customerName, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filters = {};
    if (status) filters.status = status;
    if (spcName) filters.spcName = spcName;
    if (customerName) filters.customerName = customerName;

    // Call service
    const orders = await orderService.getAllOrders(filters, parseInt(page), parseInt(limit));

    // Return paginated response
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err.message);
    return res.status(500).json({ error: "Failed to fetch all orders" });
  }
};

// 🌐 GET orders by user
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const orders = await orderService.getOrdersByUser(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ Error fetching user orders:", err.message);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

// 🌐 GET orders by approval level
exports.getOrdersByApprovalLevel = async (req, res) => {
  try {
    const { level } = req.params;
    if (level === undefined) return res.status(400).json({ error: "level is required" });

    const orders = await orderService.getOrdersByApprovalLevel(parseInt(level));
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ Error fetching orders by approval level:", err.message);
    res.status(500).json({ error: "Failed to fetch orders by approval level" });
  }
};

// 🌐 GET all active orders
exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await orderService.getActiveOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ Error fetching active orders:", err.message);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
};

// 🌐 Existing GETs
exports.getSPCPlants = async (req, res) => {
  try {
    res.status(200).json(await orderService.getSPCPlants());
  } catch (err) {
    console.error("❌ Error fetching SPC plants:", err);
    res.status(500).json({ error: "Failed to fetch SPC plants" });
  }
};

exports.getMaterialMappings = async (req, res) => {
  try {
    res.json(await orderService.getMaterialMappings());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCodeValues = async (req, res) => {
  try {
    res.json(await orderService.getCodeValues(req.params.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

