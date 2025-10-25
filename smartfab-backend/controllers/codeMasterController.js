// 📁 controllers/codeMasterController.js
const { getCodesByCategory } = require('../services/codeMasterService');

exports.getStatuses = async (req, res) => {
  try {
    const codes = await getCodesByCategory('ORDER_STATUS');
    res.json(codes.map(c => ({
      key: c.CODE_MASTER_KEY,
      value: c.CODE_MASTER_VALUE
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};