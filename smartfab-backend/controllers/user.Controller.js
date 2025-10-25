// 📁 controllers/userController.js
const { fetchAllUsers,getUserById,fetchRoleName } = require('../services/userService');

/**
 * 🔹 GET /users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers({ isActiveOnly: req.query.active === 'true' });
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users: " + err.message
    });
  }
};

exports.fetchUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.fetchRoleName = async (req, res) => {
  try {
    const { roleId } = req.params;
    // console.log(roleId)
    const roleName = await fetchRoleName(roleId);
    if (!roleName) return res.status(404).json({ success: false, message: "roleName not found" });
    res.json({ success: true, data: roleName });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};