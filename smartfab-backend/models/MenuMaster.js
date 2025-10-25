module.exports = (sequelize, DataTypes) => {
  const MenuMaster = sequelize.define('MenuMaster', {
    MENU_MASTER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MENU_MASTER_NAME: { type: DataTypes.STRING(50), allowNull: false },
    MENU_MASTER_DESCRIPTION: { type: DataTypes.STRING(100), allowNull: true },
    MENU_MASTER_PATH: { type: DataTypes.STRING(100), allowNull: true },
    MENU_MASTER_ICON: { type: DataTypes.STRING(50), allowNull: true },
    MENU_MASTER_ORDER: { type: DataTypes.INTEGER, defaultValue: 0 },
    MENU_MASTER_PARENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // remove inline references
    },
    MENU_MASTER_CREATED_BY: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'SYSTEM' },
    MENU_MASTER_CREATED_ON: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    MENU_MASTER_MODIFIED_BY: { type: DataTypes.STRING(255), allowNull: true },
    MENU_MASTER_MODIFIED_ON: { type: DataTypes.DATE, allowNull: true },
    MENU_MASTER_IS_ACTIVE: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    tableName: 'MENU_MASTER',
    schema: 'SMFB',
    timestamps: false,
  });

  MenuMaster.associate = (models) => {
    MenuMaster.hasMany(MenuMaster, { foreignKey: 'MENU_MASTER_PARENT_ID', as: 'Children' });
    MenuMaster.belongsTo(MenuMaster, { foreignKey: 'MENU_MASTER_PARENT_ID', as: 'Parent' });
  };

  return MenuMaster;
};