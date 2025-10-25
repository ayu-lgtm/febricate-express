// 📁 controllers/menuController.js
const { getMenusForUser } = require('../services/menuService');
const { getUserFromToken } = require("../services/authServices"); // ✅ fixed

exports.getUserMenus = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) return res.status(400).json({ error: "authToken required" });

    // ✅ Use service to decode token
    const { userID, username, email, role } = await getUserFromToken(authToken);

    const menus = await getMenusForUser(userID);

    res.json({ success: true, data: menus });

  } catch (err) {
    console.error("Menu fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};