// 📁 services/userService.js
const { User,Role } = require('../models');

/**
 * 🔹 Fetch all users from USER table
 * @param {Object} options - Optional filter options
 */
async function fetchAllUsers({ isActiveOnly = true } = {}) {
  const whereClause = isActiveOnly ? { USER_IS_ACTIVE: true } : {};

  const users = await User.findAll({
    where: whereClause,
    order: [['USER_USERNAME', 'ASC']]
  });

  // Map to clean JSON output
  return users.map(user => ({
    id: user.USER_ID,
    username: user.USER_USERNAME,
    email: user.USER_EMAIL,
    roleId: user.USER_ROLE_ID,
    isActive: user.USER_IS_ACTIVE,
    createdBy: user.USER_CREATED_BY,
    createdOn: user.USER_CREATED_ON,
    modifiedBy: user.USER_MODIFIED_BY,
    modifiedOn: user.USER_MODIFIED_ON
  }));
}

async function getUserById(userId) {
  return await User.findOne({
    attributes: ['USER_ID', 'USER_USERNAME','USER_ROLE_ID','USER_IS_ACTIVE'],
    where: { USER_ID: userId, USER_IS_ACTIVE: true }
  });
}

async function fetchRoleName(roleId) {
  return await Role.findOne({
    attributes: ['ROLE_ID', 'ROLE_ROLE_NAME','ROLE_IS_ACTIVE'],
    where: { ROLE_ID: roleId, ROLE_IS_ACTIVE: true }
  });
}



module.exports = { fetchAllUsers ,getUserById,fetchRoleName};