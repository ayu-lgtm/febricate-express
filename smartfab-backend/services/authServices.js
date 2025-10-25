// 📁 services/authService.js
const { decryptData } = require("./decryptService");
const { User, Role } = require("../models");

/** 🔹 Extract user info from auth token */
exports.getUserFromToken = async (authToken) => {
  try {
    const rawID = decryptData(authToken);

    const userID = rawID.split("\\")[1];
    

    const user = await User.findOne({
      where: { USER_ID: userID, USER_IS_ACTIVE: true },
      include: [
        { model: Role, as: 'Role', where: { ROLE_IS_ACTIVE: true } } // ✅ alias added
      ]
    });

    if (!user || !user.Role) throw new Error("User or role not found");

    // console.log("Full user object:", JSON.stringify(user, null, 2));
    return {
      userID,
      username: user.USER_USERNAME,
      email: user.USER_EMAIL,
      role: user.Role.ROLE_ROLE_NAME,
      roleId: user.Role.ROLE_ID,
    };

  } catch (error) {
    console.error("Error getting user from token:", error);
    throw new Error("Failed to authenticate user");
  }
};