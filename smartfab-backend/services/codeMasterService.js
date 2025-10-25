// 📁 services/codeMasterService.js
const { CODE_MASTER } = require("../models/CodeMaster");

async function getCode(category, key) {
  return CODE_MASTER.findOne({
    where: {
      CODE_MASTER_CATEGORY: category,
      CODE_MASTER_KEY: key,
      CODE_MASTER_IS_ACTIVE: true
    }
  });
}

async function getCodesByCategory(category) {
  return CODE_MASTER.findAll({
    where: { CODE_MASTER_CATEGORY: category, CODE_MASTER_IS_ACTIVE: true },
    order: [["CODE_MASTER_ORDER", "ASC"]],
  });
}

module.exports = { getCode, getCodesByCategory };