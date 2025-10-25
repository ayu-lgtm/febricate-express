const { User, Role, MenuMaster, RoleMenuMapping } = require('../models');

async function getMenusForUser(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: 'Role', // 🔹 must match index.js
        where: { ROLE_IS_ACTIVE: true },
        include: [
          {
            model: MenuMaster,
            as: 'Menus', // 🔹 matches Role ↔ MenuMaster alias
            through: {
              attributes: [
                'ROLE_MENU_MAPPING_CAN_VIEW',
                'ROLE_MENU_MAPPING_CAN_CREATE',
                'ROLE_MENU_MAPPING_CAN_EDIT',
                'ROLE_MENU_MAPPING_CAN_DELETE'
              ]
            }
          }
        ]
      }
    ]
  });

  if (!user || !user.Role) return [];

  return user.Role.Menus.map(menu => ({
    id: menu.MENU_MASTER_ID,
    name: menu.MENU_MASTER_NAME,
    path: menu.MENU_MASTER_PATH,
    icon: menu.MENU_MASTER_ICON,
    permissions: {
      canView: Boolean(menu.ROLE_MENU_MAPPING?.ROLE_MENU_MAPPING_CAN_VIEW),
      canCreate: Boolean(menu.ROLE_MENU_MAPPING?.ROLE_MENU_MAPPING_CAN_CREATE),
      canEdit: Boolean(menu.ROLE_MENU_MAPPING?.ROLE_MENU_MAPPING_CAN_EDIT),
      canDelete: Boolean(menu.ROLE_MENU_MAPPING?.ROLE_MENU_MAPPING_CAN_DELETE),
    }
  }));
}

module.exports = { getMenusForUser };