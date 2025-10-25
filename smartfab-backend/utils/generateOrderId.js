// 📁 utils/orderIdGenerator.js
const { ProductionOrder, DraftOrder } = require("../models");
const moment = require("moment");
const { Op } = require("sequelize");

/**
 * Pad a number with leading zeros
 * @param {number} num - The number to pad
 * @param {number} size - Desired length of the string (default 3)
 * @returns {string} Padded string
 */
function pad(num, size = 3) {
  return num.toString().padStart(size, "0");
}

/**
 * Generate a unique order ID for production orders
 * Format: <plantCode>-<MMM>-<sequence>
 * Example: "1440-AUG-001"
 * @param {string} plantCode
 * @returns {Promise<string>} Generated order ID
 */
async function generateOrderId(plantCode) {
  const month = moment().format("MMM").toUpperCase();
  const basePrefix = `${plantCode}-${month}`;
  let nextSeq = 1;

  // 🔹 Find last production order
  const existingProd = await ProductionOrder.findAll({
    where: {
      PRODUCTION_ORDER_ID: { [Op.like]: `${basePrefix}-%` },
    },
    order: [["PRODUCTION_ORDER_ID", "DESC"]],
    limit: 1,
  });

  if (existingProd.length > 0) {
    const lastOrderId = existingProd[0].PRODUCTION_ORDER_ID;
    const parts = lastOrderId.split("-");
    if (parts.length >= 3) {
      const lastSeq = parseInt(parts[2], 10) || 0;
      nextSeq = lastSeq + 1;
    }
  }

  // 🔹 Check draft table to prevent conflicts
  let draftConflict = true;
  while (draftConflict) {
    const paddedSeq = pad(nextSeq);
    const candidateId = `${basePrefix}-${paddedSeq}`;

    // console.log(`DRAFT-${candidateId}`)

    const conflict = await DraftOrder.findOne({
      where: { DRAFT_ORDER_ID: { [Op.like]: `DRAFT-${candidateId}` } },
    });



    if (!conflict) {
      draftConflict = false; // no conflict with draft
    } else {
      nextSeq++; // increment if conflict found
    }
  }

  const finalSeq = pad(nextSeq);
  return `${basePrefix}-${finalSeq}`;
}

/**
 * Generate a unique DRAFT order ID
 * Format: DRAFT-<plantCode>-<MMM>-<sequence>
 * Example: "DRAFT-1440-OCT-001"
 *
 * Steps:
 * 1️⃣ Check that the same sequence doesn't already exist in ProductionOrder.
 * 2️⃣ Maintain independent numbering for drafts (from DraftOrder table).
 * 3️⃣ Ensure no overlap with any existing ProductionOrder IDs.
 *
 * @param {string} plantCode
 * @returns {Promise<string>} Generated draft order ID
 */
async function generateDraftOrderId(plantCode) {
  const month = moment().format("MMM").toUpperCase();
  const basePrefix = `DRAFT-${plantCode}-${month}`;

  // 🔹 Find last draft order
  const existingDraft = await DraftOrder.findAll({
    where: {
      DRAFT_ORDER_ID: { [Op.like]: `${basePrefix}-%` },
    },
    order: [["DRAFT_ORDER_ID", "DESC"]],
    limit: 1,
  });

  let nextSeq = 1;
  if (existingDraft.length > 0) {
    const lastDraftId = existingDraft[0].DRAFT_ORDER_ID;
    const parts = lastDraftId.split("-");
    if (parts.length >= 4) {
      const lastSeq = parseInt(parts[3], 10) || 0;
      nextSeq = lastSeq + 1;
    }
  }

  // 🔹 Prevent overlap with production orders
  let draftOrderId;
  let existsInProduction = true;

  do {
    const paddedSeq = pad(nextSeq);
    draftOrderId = `${basePrefix}-${paddedSeq}`;

    const conflict = await ProductionOrder.findOne({
      where: { PRODUCTION_ORDER_ID: draftOrderId.replace("DRAFT-", "") },
    });

    if (!conflict) existsInProduction = false;
    else nextSeq++; // increment if conflict found
  } while (existsInProduction);

  return draftOrderId;
}

module.exports = {
  generateOrderId,
  generateDraftOrderId,
};