// 📁 utils/orderPayloadBuilder.js

/**
 * Build payload for production order (create/update)
 * Handles sanitation of numbers, strings, booleans, dates
 */

export function buildOrderPayload(form, isEditMode = false, isDraftMode = false) {
  const [plantCode] = form.spcName?.split("-") || ["XXXX"];

  const sanitizeString = (val, defaultVal = "NA") => {
    if (!val || val.trim().length === 0) return defaultVal;
    return val.toString().trim().slice(0, 40);
  };

  const sanitizeNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const sanitizeBoolean = (val) => {
    if (val === true || val === 1 || val?.toString().toLowerCase() === "yes") return true;
    return false;
  };

  const basePayload = {
    requestorId: sessionStorage.getItem("userID") || "SYSTEM",
    spcName: form.spcName,
    plantCode,
    customerName: sanitizeString(form.customerName, ""),
    application: sanitizeString(form.application, ""),
    meshType: sanitizeString(form.meshType, ""),
    weldmeshQty: sanitizeNumber(form.quantity),
    unit: sanitizeString(form.unit, ""),
    weldmeshDetails: sanitizeString(form.details, ""),
    dispatchLocation: sanitizeString(form.location, ""),
    orderType: sanitizeString(form.orderType, ""),
    rmMaterialNo: sanitizeString(form.rmMaterial, ""),
    rmMaterialDescription: sanitizeString(form.rmMaterialDescription, "NA"),
    rmType: sanitizeString(form.rmType, ""),
    cityCode: sanitizeString(form.city, ""),
    freightMaintained: sanitizeBoolean(form.freight),
    freightPoNumber: sanitizeBoolean(form.freight) ? sanitizeString(form.freightPoNumber, "") : null,
    freightStdRate: sanitizeBoolean(form.freight) ? sanitizeNumber(form.freightStdRate) : null,
    fgMaterialNumber: sanitizeString(form.fgMaterial, ""),
    fgMaterialDescription: sanitizeString(form.fgMaterialDescription, "NA"),
    remarks: sanitizeString(form.remarks, ""),
    deliveryDate: form.deliveryDate ? new Date(form.deliveryDate) : null,
    vehicleType: sanitizeString(form.vehicleType, ""),
    createdDate: new Date().toISOString(),
  };

  if (!isEditMode) {
    // New orders
    return {
      ...basePayload,
      status: "Pending with SPC Manager",
      currentApprovalLevel: 1,
      finalStatus: null,
    };
  }

  // Edit mode – preserve existing workflow
  return basePayload;
}

/**
 * Build payload for draft orders
 */
export function buildDraftPayload(form) {
  const [plantCode] = form.spcName?.split("-") || ["XXXX"];

  const sanitizeString = (val, defaultVal = "NA") => {
    if (!val || val.trim().length === 0) return defaultVal;
    return val.toString().trim().slice(0, 40);
  };

  const sanitizeNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const sanitizeBoolean = (val) => {
    if (val === true || val === 1 || val?.toString().toLowerCase() === "yes") return true;
    return false;
  };

  return {
    requestorId: sessionStorage.getItem("userID") || "SYSTEM",
    spcName: form.spcName,
    plantCode,
    customerName: sanitizeString(form.customerName, ""),
    application: sanitizeString(form.application, ""),
    meshType: sanitizeString(form.meshType, ""),
    weldmeshQty: sanitizeNumber(form.quantity),
    unit: sanitizeString(form.unit, ""),
    weldmeshDetails: sanitizeString(form.details, ""),
    dispatchLocation: sanitizeString(form.location, ""),
    orderType: sanitizeString(form.orderType, ""),
    rmMaterialNo: sanitizeString(form.rmMaterial, ""),
    rmMaterialDescription: sanitizeString(form.rmMaterialDescription, "NA"),
    rmType: sanitizeString(form.rmType, ""),
    cityCode: sanitizeString(form.city, ""),
    freightMaintained: sanitizeBoolean(form.freight),
    freightPoNumber: sanitizeBoolean(form.freight) ? sanitizeString(form.freightPoNumber, "") : null,
    freightStdRate: sanitizeBoolean(form.freight) ? sanitizeNumber(form.freightStdRate) : null,
    fgMaterialNumber: sanitizeString(form.fgMaterial, ""),
    fgMaterialDescription: sanitizeString(form.fgMaterialDescription, "NA"),
    remarks: sanitizeString(form.remarks, ""),
    deliveryDate: form.deliveryDate ? new Date(form.deliveryDate) : null,
    vehicleType: sanitizeString(form.vehicleType, ""),
    lastActivity: new Date().toISOString(),
    completionPercentage: calculateCompletionPercentage(form),
    missingFields: getMissingRequiredFields(form),
  };
}

/**
 * Calculate completion percentage for drafts
 */
function calculateCompletionPercentage(form) {
  const requiredFields = [
    'spcName', 'customerName', 'application', 'meshType', 'quantity',
    'unit', 'details', 'location', 'orderType', 'rmMaterial', 'rmType',
    'deliveryDate', 'city', 'freight', 'fgMaterial', 'vehicleType'
  ];

  const filledFields = requiredFields.filter(field => {
    const value = form[field];
    return value !== undefined && value !== null && value !== '' &&
      !(typeof value === 'string' && value.trim() === '');
  });

  return Math.round((filledFields.length / requiredFields.length) * 100);
}

/**
 * Get missing required fields for draft tracking
 */
function getMissingRequiredFields(form) {
  const requiredFields = [
    'spcName', 'customerName', 'application', 'meshType', 'quantity',
    'unit', 'details', 'location', 'orderType', 'rmMaterial', 'rmType',
    'deliveryDate', 'city', 'freight', 'fgMaterial', 'vehicleType'
  ];

  const fieldLabels = {
    spcName: 'SPC Name',
    customerName: 'Customer Name',
    application: 'Application',
    meshType: 'Mesh Type',
    quantity: 'Quantity',
    unit: 'Unit',
    details: 'Weldmesh Details',
    location: 'Dispatch Location',
    orderType: 'Order Type',
    rmMaterial: 'RM Material',
    rmType: 'RM Type',
    deliveryDate: 'Delivery Date',
    city: 'City',
    freight: 'Freight',
    fgMaterial: 'FG Material',
    vehicleType: 'Vehicle Type'
  };

  return requiredFields
    .filter(field => {
      const value = form[field];
      return !value || (typeof value === 'string' && value.trim() === '') || value === undefined || value === null;
    })
    .map(field => fieldLabels[field] || field);
}

/**
 * Validate payload before submission
 */
export function validateOrderPayload(payload, isDraftMode = false) {
  const errors = [];
  const requiredFields = [
    'spcName', 'customerName', 'application', 'meshType', 'weldmeshQty',
    'unit', 'weldmeshDetails', 'dispatchLocation', 'orderType', 'rmMaterialNo',
    'rmType', 'deliveryDate', 'cityCode', 'freightMaintained', 'fgMaterialNumber',
    'vehicleType'
  ];

  if (!isDraftMode) {
    requiredFields.forEach(field => {
      const val = payload[field];
      if (val === null || val === undefined ||
          (typeof val === 'string' && val.trim() === '') ||
          (typeof val === 'number' && isNaN(val))) {
        errors.push(field);
      }
    });
  }

  if (payload.weldmeshQty && (isNaN(payload.weldmeshQty) || payload.weldmeshQty <= 0)) {
    errors.push('Invalid quantity');
  }

  if (payload.freightStdRate && isNaN(payload.freightStdRate)) {
    errors.push('Invalid freight rate');
  }

  if (payload.deliveryDate) {
    const deliveryDate = new Date(payload.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate < today) errors.push('Delivery date cannot be in the past');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Transform payload for API submission (FormData conversion)
 */
export function transformPayloadForAPI(payload, mode = 'create') {
  const transformed = { ...payload };
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === null || transformed[key] === undefined) transformed[key] = '';
    if (typeof transformed[key] === 'number') transformed[key] = transformed[key].toString();
  });
  if (mode === 'update') transformed.updatedDate = new Date().toISOString();
  return transformed;
}

/**
 * Extract file info for payload
 */
export function getFilePayloadInfo(form, existingOrder = null) {
  return {
    drawingFileName: form.drawingFile ? form.drawingFile.name : form.drawing,
    poCopyFileName: form.poCopyFile ? form.poCopyFile.name : form.poCopy,
    hasNewDrawing: !!form.drawingFile,
    hasNewPoCopy: !!form.poCopyFile,
    existingDrawing: existingOrder?.PRODUCTION_ORDER_DRAWING_ATTACHMENT_NAME,
    existingPoCopy: existingOrder?.PRODUCTION_ORDER_PO_ATTACHMENT_NAME
  };
}