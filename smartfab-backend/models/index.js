// 📁 models/index.js
const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// ===== Model Imports =====
const Role = require('./Role')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const ProductionOrder = require('./ProductionOrder')(sequelize, DataTypes);
const SPCPlant = require('./spcPlant')(sequelize, DataTypes);
const MaterialMapping = require('./MaterialMapping')(sequelize, DataTypes);
const ApprovalWorkflow = require('./ApprovalWorkflow')(sequelize, DataTypes);
const CodeMaster = require('./CodeMaster')(sequelize, DataTypes);
const MenuMaster = require('./MenuMaster')(sequelize, DataTypes);
const RoleMenuMapping = require('./RoleMenuMapping')(sequelize, DataTypes);
const DraftOrder = require('./DraftOrder')(sequelize, DataTypes);
const ConversionCharge = require('./ConversionCharges')(sequelize, DataTypes);
const RMFreight = require('./RMFreight')(sequelize, DataTypes);
const TransferPrice = require('./TransferPrice')(sequelize, DataTypes);
const ProductionRecording = require('./ProductionRecording')(sequelize, DataTypes);




// ==================== Associations ====================

// 🔹 User ↔ Role
Role.hasMany(User, { foreignKey: 'USER_ROLE_ID', as: 'Users' });
User.belongsTo(Role, { foreignKey: 'USER_ROLE_ID', as: 'Role' });

// 🔹 User ↔ ProductionOrder
User.hasMany(ProductionOrder, { foreignKey: 'PRODUCTION_ORDER_REQUESTOR_ID', as: 'Orders' });
ProductionOrder.belongsTo(User, { foreignKey: 'PRODUCTION_ORDER_REQUESTOR_ID', as: 'Requestor' });

// ProductionOrder ↔ ProductionRecording
ProductionOrder.hasMany(ProductionRecording, {
  foreignKey: 'PRODUCTION_RECORDING_ORDER_ID',
  sourceKey: 'PRODUCTION_ORDER_ID',
  as: 'ProductionRecordings',
  onDelete: 'CASCADE'
});
ProductionRecording.belongsTo(ProductionOrder, {
  foreignKey: 'PRODUCTION_RECORDING_ORDER_ID',
  targetKey: 'PRODUCTION_ORDER_ID',
  as: 'Order'
});



// 🔹 Role ↔ MenuMaster (Many-to-Many via RoleMenuMapping)
Role.belongsToMany(MenuMaster, {
  through: RoleMenuMapping,
  foreignKey: 'ROLE_MENU_MAPPING_ROLE_ID',
  otherKey: 'ROLE_MENU_MAPPING_MENU_ID',
  as: 'Menus'
});
MenuMaster.belongsToMany(Role, {
  through: RoleMenuMapping,
  foreignKey: 'ROLE_MENU_MAPPING_MENU_ID',
  otherKey: 'ROLE_MENU_MAPPING_ROLE_ID',
  as: 'Roles'
});

// 🔹 ProductionOrder ↔ ApprovalWorkflow
ProductionOrder.hasMany(ApprovalWorkflow, {
  foreignKey: 'APPROVAL_WORKFLOW_ORDER_ID',
  sourceKey: 'PRODUCTION_ORDER_ID',
  as: 'ApprovalWorkflows',
  onDelete: 'CASCADE'
});
ApprovalWorkflow.belongsTo(ProductionOrder, {
  foreignKey: 'APPROVAL_WORKFLOW_ORDER_ID',
  targetKey: 'PRODUCTION_ORDER_ID',
  as: 'Order'
});

// 🔹 User ↔ DraftOrder (NEW: User can have multiple drafts)
User.hasMany(DraftOrder, { 
  foreignKey: 'DRAFT_ORDER_REQUESTOR_ID', 
  as: 'DraftOrders' 
});
DraftOrder.belongsTo(User, { 
  foreignKey: 'DRAFT_ORDER_REQUESTOR_ID', 
  as: 'Requestor' 
});



// 🔹 Role ↔ ApprovalWorkflow (who needs to approve)
Role.hasMany(ApprovalWorkflow, { foreignKey: 'APPROVAL_WORKFLOW_ROLE_ID', as: 'ApprovalWorkflows' });
ApprovalWorkflow.belongsTo(Role, { foreignKey: 'APPROVAL_WORKFLOW_ROLE_ID', as: 'Role' });

// 🔹 User ↔ ApprovalWorkflow (who acted)
User.hasMany(ApprovalWorkflow, { foreignKey: 'APPROVAL_WORKFLOW_CREATED_BY', sourceKey: 'USER_ID', as: 'CreatedWorkflows' });
ApprovalWorkflow.belongsTo(User, { foreignKey: 'APPROVAL_WORKFLOW_CREATED_BY', targetKey: 'USER_ID', as: 'CreatedBy' });





module.exports = {
  sequelize,
  DataTypes,
  User,
  Role,
  ProductionOrder,
  SPCPlant,
  MaterialMapping,
  ApprovalWorkflow,
  CodeMaster,
  MenuMaster,
  RoleMenuMapping,
  DraftOrder,
  ConversionCharge,
  RMFreight,
  TransferPrice,
  ProductionRecording,
};
