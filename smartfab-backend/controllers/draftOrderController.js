// controllers/draftOrderController.js
const fs = require("fs");
const path = require("path");
const draftOrderService = require("../services/DraftOrderService");
const orderService = require("../services/orderService");
const { getUserFromToken } = require("../services/authServices");



exports.saveDraft = async (req, res) => {
  let savedFiles = [];
  
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });
    
    const user = await getUserFromToken(authToken);
    const { draftId, ...draftData } = req.body;
    
    if (!draftData.spcName) {
      return res.status(400).json({ error: "SPC Name is required for draft" });
    }

    // Map request data to draft model fields
    const qty = parseFloat(draftData.weldmeshQty);
    const stdRate = parseFloat(draftData.freightStdRate);
    
    const mappedData = {
      DRAFT_ORDER_ID: draftId,
      DRAFT_ORDER_SPC_NAME: draftData.spcName || null,
      DRAFT_ORDER_REQUESTOR_ID: user.userID,
      DRAFT_ORDER_CITY_CODE: draftData.cityCode || null,
      DRAFT_ORDER_VEHICLE_TYPE: draftData.vehicleType || null,
      DRAFT_ORDER_CUSTOMER_NAME: draftData.customerName || null,
      DRAFT_ORDER_APPLICATION: draftData.application || null,
      DRAFT_ORDER_MESH_TYPE: draftData.meshType || null,
      DRAFT_ORDER_WELDMESH_QTY: !isNaN(qty) ? qty : null,
      DRAFT_ORDER_UNIT: draftData.unit || null,
      DRAFT_ORDER_WELDMESH_DETAILS: draftData.weldmeshDetails || "",
      DRAFT_ORDER_DISPATCH_LOCATION: draftData.dispatchLocation || null,
      DRAFT_ORDER_ORDER_TYPE: draftData.orderType || null,
      DRAFT_ORDER_RM_MATERIAL_NO: draftData.rmMaterialNo || null,
      DRAFT_ORDER_RM_TYPE: draftData.rmType || null,
      DRAFT_ORDER_RM_MATERIAL_DESCRIPTION: draftData.rmMaterialDescription || "NA",
      DRAFT_ORDER_FG_MATERIAL_NUMBER: draftData.fgMaterialNumber || null,
      DRAFT_ORDER_FG_MATERIAL_DESCRIPTION: draftData.fgMaterialDescription || "NA",
      DRAFT_ORDER_FREIGHT_MAINTAINED: draftData.freightMaintained === "Yes",
      DRAFT_ORDER_FREIGHT_PO_NUMBER: draftData.freightPoNumber || null,
      DRAFT_ORDER_FREIGHT_STD_RATE: !isNaN(stdRate) ? stdRate : null,
      DRAFT_ORDER_REMARKS: draftData.remarks || "",
      DRAFT_ORDER_DELIVERY_DATE: draftData.deliveryDate ? new Date(draftData.deliveryDate) : null,
    };

    let savedDraft;
    
    if (draftId && draftId !== 'undefined' && draftId !== 'null') {
      savedDraft = await draftOrderService.updateDraftOrder(draftId, mappedData, user.userID);
    } else {
      savedDraft = await draftOrderService.createDraftOrder(mappedData, user.userID);
    }

    // Handle file uploads
    if (req.files?.drawing?.[0] || req.files?.poCopy?.[0]) {
      const targetDir = path.join(__dirname, "../uploads/drafts", savedDraft.DRAFT_ORDER_ID);
      fs.mkdirSync(targetDir, { recursive: true });

      const fileUpdates = {};

      // Process Drawing file
      if (req.files?.drawing?.[0]) {
        const fileInfo = saveUploadedFile(req.files.drawing[0], targetDir, "drawing");
        if (fileInfo) {
          savedFiles.push(fileInfo.path);
          fileUpdates.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH = `drafts/${savedDraft.DRAFT_ORDER_ID}/${fileInfo.fileName}`;
          fileUpdates.DRAFT_ORDER_DRAWING_ATTACHMENT_NAME = fileInfo.originalName;
        }
      }

      // Process PO Copy file
      if (req.files?.poCopy?.[0]) {
        const fileInfo = saveUploadedFile(req.files.poCopy[0], targetDir, "pocopy");
        if (fileInfo) {
          savedFiles.push(fileInfo.path);
          fileUpdates.DRAFT_ORDER_PO_ATTACHMENT_PATH = `drafts/${savedDraft.DRAFT_ORDER_ID}/${fileInfo.fileName}`;
          fileUpdates.DRAFT_ORDER_PO_ATTACHMENT_NAME = fileInfo.originalName;
        }
      }

      // Update draft with file info
      if (Object.keys(fileUpdates).length > 0) {
        await draftOrderService.updateDraftOrder(savedDraft.DRAFT_ORDER_ID, fileUpdates, user.userID);
        savedDraft = await draftOrderService.getDraftById(savedDraft.DRAFT_ORDER_ID);
      }
    }

    return res.status(200).json({
      success: true,
      data: savedDraft,
      message: draftId ? "Draft updated successfully" : "Draft saved successfully"
    });
    
  } catch (err) {
    console.error("❌ Draft save error:", err.message);
    
    // Cleanup on error
    savedFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("File cleanup error:", e.message);
        }
      }
    });
    
    return res.status(400).json({
      error: "Failed to save draft",
      details: err.message
    });
  }
};


// Enhanced file handling utilities
const saveUploadedFile = (file, targetDir, prefix) => {
  if (!file) return null;
  
  const originalName = file.originalname;
  const ext = path.extname(originalName);
  const fileName = `${prefix}_${Date.now()}${ext}`;
  const filePath = path.join(targetDir, fileName);
  
  fs.renameSync(file.path, filePath);
  
  return {
    path: filePath,
    relativePath: `${targetDir.split(path.sep).pop()}/${fileName}`,
    originalName: originalName,
    fileName: fileName
  };
};


const moveFileToFinalLocation = (sourcePath, targetDir, newFileName) => {
  if (!sourcePath || !fs.existsSync(sourcePath)) return null;
  
  const targetPath = path.join(targetDir, newFileName);
  fs.copyFileSync(sourcePath, targetPath);
  
  return `${targetDir.split(path.sep).pop()}/${newFileName}`;
};
// Utility: safely parse and sanitize values
const sanitize = (value, type = "string") => {
  if (value === undefined || value === null || value === "") {
    return type === "number" ? null : null;
  }
  return type === "number" ? parseFloat(value) : value;
};

// Utility: Copy files from draft folder to final order folder (FIXED)
const moveFilesToOrderFolder = async (draftId, orderId, draft) => {
  const draftBaseDir = path.join(__dirname, "../uploads/drafts");
  const orderBaseDir = path.join(__dirname, "../uploads/orders");
  
  const draftDir = path.join(draftBaseDir, draftId);
  const orderDir = path.join(orderBaseDir, orderId);
  
  fs.mkdirSync(orderDir, { recursive: true });
  
  const updatedPaths = {
    drawing: null,
    poCopy: null
  };

  // Process drawing file
  if (draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH) {
    const oldDrawingPath = path.join(__dirname, "../uploads", draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH);
    if (fs.existsSync(oldDrawingPath)) {
      const fileName = path.basename(oldDrawingPath);
      const newRelativePath = moveFileToFinalLocation(oldDrawingPath, orderDir, fileName);
      updatedPaths.drawing = newRelativePath;
    }
  }

  // Process PO copy file
  if (draft.DRAFT_ORDER_PO_ATTACHMENT_PATH) {
    const oldPoPath = path.join(__dirname, "../uploads", draft.DRAFT_ORDER_PO_ATTACHMENT_PATH);
    if (fs.existsSync(oldPoPath)) {
      const fileName = path.basename(oldPoPath);
      const newRelativePath = moveFileToFinalLocation(oldPoPath, orderDir, fileName);
      updatedPaths.poCopy = newRelativePath;
    }
  }

  return updatedPaths;
};

exports.convertDraftToOrder = async (req, res) => {
  try {
    const { draftId } = req.params;
    const authToken = req.headers["authorization"]?.split(" ")[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });
    
    const user = await getUserFromToken(authToken);
    const draft = await draftOrderService.getDraftById(draftId);
    
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    
    const orderId = draft.DRAFT_ORDER_ID.replace(/^DRAFT-/, "");
    
    // Prevent duplicate orders
    const existingOrder = await orderService.getOrderById(orderId);
    if (existingOrder) {
      return res.status(400).json({ error: `Order with ID ${orderId} already exists.` });
    }

    // Move files to final order folder
    const movedPaths = await moveFilesToOrderFolder(draftId, orderId, draft);
    
    const freightMaintain = draft.DRAFT_ORDER_FREIGHT_MAINTAINED === "Yes" || 
                           draft.DRAFT_ORDER_FREIGHT_MAINTAINED === true || 
                           draft.DRAFT_ORDER_FREIGHT_MAINTAINED === 1;

    const orderData = {
      PRODUCTION_ORDER_ID: orderId,
      PRODUCTION_ORDER_REQUESTOR_ID: user.userID,
      PRODUCTION_ORDER_SPC_NAME: draft.DRAFT_ORDER_SPC_NAME,
      PRODUCTION_ORDER_CITY_CODE: draft.DRAFT_ORDER_CITY_CODE,
      PRODUCTION_ORDER_VEHICLE_TYPE: draft.DRAFT_ORDER_VEHICLE_TYPE,
      PRODUCTION_ORDER_CUSTOMER_NAME: draft.DRAFT_ORDER_CUSTOMER_NAME,
      PRODUCTION_ORDER_APPLICATION: draft.DRAFT_ORDER_APPLICATION,
      PRODUCTION_ORDER_MESH_TYPE: draft.DRAFT_ORDER_MESH_TYPE,
      PRODUCTION_ORDER_WELDMESH_QTY: parseFloat(draft.DRAFT_ORDER_WELDMESH_QTY) || 0,
      PRODUCTION_ORDER_UNIT: draft.DRAFT_ORDER_UNIT,
      PRODUCTION_ORDER_WELDMESH_DETAILS: draft.DRAFT_ORDER_WELDMESH_DETAILS,
      PRODUCTION_ORDER_DISPATCH_LOCATION: draft.DRAFT_ORDER_DISPATCH_LOCATION,
      PRODUCTION_ORDER_ORDER_TYPE: draft.DRAFT_ORDER_ORDER_TYPE,
      PRODUCTION_ORDER_RM_MATERIAL_NO: draft.DRAFT_ORDER_RM_MATERIAL_NO,
      PRODUCTION_ORDER_RM_TYPE: draft.DRAFT_ORDER_RM_TYPE,
      PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION: draft.DRAFT_ORDER_RM_MATERIAL_DESCRIPTION,
      PRODUCTION_ORDER_FG_MATERIAL_NUMBER: draft.DRAFT_ORDER_FG_MATERIAL_NUMBER,
      PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION: draft.DRAFT_ORDER_FG_MATERIAL_DESCRIPTION,
      PRODUCTION_ORDER_FREIGHT_MAINTAINED: freightMaintain,
      PRODUCTION_ORDER_FREIGHT_PO_NUMBER: freightMaintain ? draft.DRAFT_ORDER_FREIGHT_PO_NUMBER : null,
      PRODUCTION_ORDER_FREIGHT_STD_RATE: freightMaintain ? parseFloat(draft.DRAFT_ORDER_FREIGHT_STD_RATE) : null,
      PRODUCTION_ORDER_REMARKS: draft.DRAFT_ORDER_REMARKS,
      PRODUCTION_ORDER_DELIVERY_DATE: draft.DRAFT_ORDER_DELIVERY_DATE ? new Date(draft.DRAFT_ORDER_DELIVERY_DATE) : null,
      PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH: movedPaths.drawing,
      PRODUCTION_ORDER_PO_ATTACHMENT_PATH: movedPaths.poCopy,
      PRODUCTION_ORDER_DRAWING_ATTACHMENT_NAME: draft.DRAFT_ORDER_DRAWING_ATTACHMENT_NAME,
      PRODUCTION_ORDER_PO_ATTACHMENT_NAME: draft.DRAFT_ORDER_PO_ATTACHMENT_NAME,
      PRODUCTION_ORDER_STATUS: "Pending with SPC Manager",
      PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL: 1,
      PRODUCTION_ORDER_FINAL_STATUS: null,
    };

    const createdOrder = await orderService.createOrder(orderData, user.userID);
    
    // Delete draft after successful conversion
    await draftOrderService.deleteDraft(draftId);
    
    return res.status(201).json({
      success: true,
      message: "Draft successfully converted to order",
      data: createdOrder,
    });
    
  } catch (err) {
    console.error("❌ Error converting draft to order:", err.message);
    return res.status(500).json({
      error: "Failed to convert draft",
      details: err.message
    });
  }
};




// Other controller methods...
exports.getDraft = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });

    const user = await getUserFromToken(authToken);
    const { draftId } = req.params;

    if (!draftId) return res.status(400).json({ error: "draftId is required" });

    const draft = await draftOrderService.getDraftById(draftId);
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    return res.status(200).json({ success: true, data: draft });
  } catch (err) {
    console.error("❌ Error fetching draft:", err.message);
    return res.status(500).json({ error: "Failed to fetch draft" });
  }
};

exports.getUserDrafts = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });

    const user = await getUserFromToken(authToken);
    const drafts = await draftOrderService.getUserDrafts(user.userID);

    return res.status(200).json({
      success: true,
      data: { drafts }
    });
  } catch (err) {
    console.error("❌ Error fetching user drafts:", err.message);
    return res.status(500).json({ error: "Failed to fetch user drafts" });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });

    const user = await getUserFromToken(authToken);
    const { draftId } = req.params;
    const result = await draftOrderService.deleteDraft(draftId, user.userID);

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error deleting draft:", err.message);
    return res.status(500).json({ error: "Failed to delete draft" });
  }
};

exports.downloadDraftFile = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(401).json({ error: "Authentication required" });

    const user = await getUserFromToken(authToken);
    const { draftId, filename } = req.params;

    // Get draft to verify ownership
    const draft = await draftOrderService.getDraftById(draftId);
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    if (draft.DRAFT_ORDER_REQUESTOR_ID !== user.userID) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Construct file path
    let filePath;
    if (filename === draft.DRAFT_ORDER_DRAWING_ATTACHMENT_NAME) {
      filePath = path.join(__dirname, "../uploads", draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH);
    } else if (filename === draft.DRAFT_ORDER_PO_ATTACHMENT_NAME) {
      filePath = path.join(__dirname, "../uploads", draft.DRAFT_ORDER_PO_ATTACHMENT_PATH);
    } else {
      return res.status(404).json({ error: "File not found" });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Set appropriate headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error("❌ Draft file download error:", err.message);
    return res.status(500).json({ error: "Failed to download file" });
  }
};