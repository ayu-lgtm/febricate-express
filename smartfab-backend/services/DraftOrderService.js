// services/DraftOrderService.js
const { DraftOrder, User } = require("../models");
const { generateDraftOrderId, generateOrderId } = require("../utils/generateOrderId");
const fs = require("fs");
const path = require("path");

exports.createDraftOrder = async (draftData, userId) => {
  try {
    // Generate draft ID with DRAFT- prefix
    const [plantCode] = draftData.DRAFT_ORDER_SPC_NAME.split("-");
    const draftId = await generateDraftOrderId(plantCode);
    draftData.DRAFT_ORDER_ID = draftId;
        
    const draft = await DraftOrder.create({
      ...draftData,
    });
        
    return draft.toJSON();
  } catch (err) {
    console.error("Service layer error in createDraftOrder:", err.message);
    throw err;
  }
};

exports.updateDraftOrder = async (draftId, updateData, userId) => {
  try {
    const draft = await DraftOrder.findOne({
      where: { DRAFT_ORDER_ID: draftId }
    });
            
    if (!draft) throw new Error("Draft not found");
        
    const updatedDraft = await draft.update(updateData, { userId });
    return updatedDraft.toJSON();
  } catch (err) {
    console.error("Service layer error in updateDraftOrder:", err.message);
    throw err;
  }
};

exports.getDraftById = async (draftId) => {
  try {
    const draft = await DraftOrder.findOne({
      where: { DRAFT_ORDER_ID: draftId }
    });
        
    if (!draft) return null;
        
    const draftData = draft.toJSON();
    const completion = calculateCompletionPercentage(draftData);
        
    return {
      ...draftData,
      completionPercentage: completion.percentage,
      missingFields: completion.missingFields
    };
  } catch (error) {
    console.error("Error in getDraftById service:", error.message);
    throw new Error("Failed to fetch draft");
  }
};

exports.getUserDrafts = async (userId) => {
  try {
    const drafts = await DraftOrder.findAll({
      where: {
        DRAFT_ORDER_REQUESTOR_ID: userId,
        DRAFT_ORDER_IS_ACTIVE: true
      },
      order: [["DRAFT_ORDER_LAST_ACTIVITY", "DESC"]],
      include: [
        {
          model: User,
          as: 'Requestor',
          attributes: ['USER_ID', 'USER_USERNAME', 'USER_EMAIL']
        }
      ]
    });
        
    const draftsWithCompletion = drafts.map(draft => {
      const draftData = draft.toJSON();
      const completion = calculateCompletionPercentage(draftData);
            
      return {
        ...draftData,
        completionPercentage: completion.percentage,
        missingFields: completion.missingFields
      };
    });
        
    return draftsWithCompletion;
  } catch (error) {
    console.error("Error in getUserDrafts service:", error.message);
    throw new Error("Failed to fetch user drafts");
  }
};

exports.deleteDraft = async (draftId, userId) => {
  try {
    const draft = await DraftOrder.findOne({
      where: { DRAFT_ORDER_ID: draftId }
    });
            
    if (!draft) throw new Error("Draft not found");
            
    await draft.update({
      DRAFT_ORDER_IS_ACTIVE: false
    }, { userId });
            
    return { success: true, message: "Draft deleted successfully" };
  } catch (error) {
    console.error("Error in deleteDraft service:", error.message);
    throw new Error("Failed to delete draft");
  }
};


// Save or update draft
exports.saveOrUpdateDraft = async (data) => {
  try {
    const existing = await DraftOrder.findOne({ where: { DRAFT_ORDER_ID: data.DRAFT_ORDER_ID } });

    if (existing) {
      await existing.update(data);
      return existing.toJSON();
    } else {
      const newDraft = await DraftOrder.create(data);
      return newDraft.toJSON();
    }
  } catch (err) {
    console.error("Error saving draft:", err.message);
    throw err;
  }
};

// Get draft by ID
exports.getDraftById = async (draftId) => {
  try {
    const draft = await DraftOrder.findOne({ where: { DRAFT_ORDER_ID: draftId } });
    return draft ? draft.toJSON() : null;
  } catch (err) {
    console.error("Error fetching draft:", err.message);
    throw err;
  }
};

// Mark draft as converted
exports.markAsConverted = async (draftId) => {
  try {
    const draft = await DraftOrder.findOne({ where: { DRAFT_ORDER_ID: draftId } });
    if (!draft) return;
    await draft.update({ DRAFT_ORDER_STATUS: "Converted" });
  } catch (err) {
    console.error("Error marking draft as converted:", err.message);
    throw err;
  }
};

// Helper function to calculate completion percentage
function calculateCompletionPercentage(draft) {
  const requiredFields = [
    'DRAFT_ORDER_SPC_NAME',
    'DRAFT_ORDER_CUSTOMER_NAME',
    'DRAFT_ORDER_APPLICATION',
    'DRAFT_ORDER_MESH_TYPE',
    'DRAFT_ORDER_WELDMESH_QTY',
    'DRAFT_ORDER_UNIT',
    'DRAFT_ORDER_WELDMESH_DETAILS',
    'DRAFT_ORDER_DISPATCH_LOCATION',
    'DRAFT_ORDER_ORDER_TYPE',
    'DRAFT_ORDER_RM_MATERIAL_NO',
    'DRAFT_ORDER_RM_TYPE',
    'DRAFT_ORDER_DELIVERY_DATE',
    'DRAFT_ORDER_CITY_CODE',
    'DRAFT_ORDER_FREIGHT_MAINTAINED',
    'DRAFT_ORDER_FG_MATERIAL_NUMBER',
    'DRAFT_ORDER_VEHICLE_TYPE'
  ];
    
  const fileFields = [
    'DRAFT_ORDER_DRAWING_ATTACHMENT_PATH',
    'DRAFT_ORDER_PO_ATTACHMENT_PATH'
  ];
    
  let filledCount = 0;
  const missingFields = [];
    
  requiredFields.forEach(field => {
    if (draft[field] && draft[field].toString().trim() !== '') {
      filledCount++;
    } else {
      missingFields.push(field.replace('DRAFT_ORDER_', '').replace(/_/g, ' '));
    }
  });
    
  fileFields.forEach(field => {
    if (draft[field] && draft[field].toString().trim() !== '') {
      filledCount++;
    } else {
      missingFields.push(field.replace('DRAFT_ORDER_', '').replace(/_/g, ' '));
    }
  });
    
  const totalFields = requiredFields.length + fileFields.length;
  const percentage = Math.round((filledCount / totalFields) * 100);
    
  return { percentage, missingFields };
}