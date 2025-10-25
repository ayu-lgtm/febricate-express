const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const DRAFT_ORDER = sequelize.define('DRAFT_ORDER', {
    DRAFT_ORDER_ID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    DRAFT_ORDER_REQUESTOR_ID: { type: DataTypes.STRING, allowNull: false },
    DRAFT_ORDER_SPC_NAME: { type: DataTypes.STRING, allowNull: false },
    DRAFT_ORDER_CITY_CODE: { type: DataTypes.STRING },
    DRAFT_ORDER_VEHICLE_TYPE: { type: DataTypes.STRING },
    DRAFT_ORDER_CUSTOMER_NAME: { type: DataTypes.STRING },
    DRAFT_ORDER_APPLICATION: { type: DataTypes.STRING },
    DRAFT_ORDER_MESH_TYPE: { type: DataTypes.STRING },
    DRAFT_ORDER_WELDMESH_QTY: { type: DataTypes.DECIMAL(18, 2) },
    DRAFT_ORDER_UNIT: { type: DataTypes.STRING },
    DRAFT_ORDER_WELDMESH_DETAILS: { type: DataTypes.TEXT },
    DRAFT_ORDER_DISPATCH_LOCATION: { type: DataTypes.STRING },
    DRAFT_ORDER_ORDER_TYPE: { type: DataTypes.STRING },
    DRAFT_ORDER_RM_MATERIAL_NO: { type: DataTypes.STRING },
    DRAFT_ORDER_RM_TYPE: { type: DataTypes.STRING },
    DRAFT_ORDER_RM_MATERIAL_DESCRIPTION: { type: DataTypes.STRING(40) },
    DRAFT_ORDER_FG_MATERIAL_DESCRIPTION: { type: DataTypes.STRING(40) },
    DRAFT_ORDER_FG_MATERIAL_NUMBER: { type: DataTypes.STRING },
    DRAFT_ORDER_FREIGHT_MAINTAINED: {
      type: DataTypes.BOOLEAN,
      set(v) {
        this.setDataValue(
          'DRAFT_ORDER_FREIGHT_MAINTAINED',
          v === 'Yes' || v === true || v === 1
        );
      },
      get() {
        return this.getDataValue('DRAFT_ORDER_FREIGHT_MAINTAINED') ? 'Yes' : 'No';
      }
    },

    
    DRAFT_ORDER_FREIGHT_PO_NUMBER: { type: DataTypes.STRING },
    DRAFT_ORDER_FREIGHT_STD_RATE: { type: DataTypes.DECIMAL(18, 2) },
    DRAFT_ORDER_REMARKS: { type: DataTypes.TEXT },
    DRAFT_ORDER_DELIVERY_DATE: { type: DataTypes.DATE },
    DRAFT_ORDER_DRAWING_ATTACHMENT_NAME: { type: DataTypes.STRING },
    DRAFT_ORDER_PO_ATTACHMENT_NAME: { type: DataTypes.STRING },
    DRAFT_ORDER_DRAWING_ATTACHMENT_PATH: { type: DataTypes.STRING },
    DRAFT_ORDER_PO_ATTACHMENT_PATH: { type: DataTypes.STRING },
    DRAFT_ORDER_COMPLETION_PERCENTAGE: { type: DataTypes.INTEGER, defaultValue: 0 },
    DRAFT_ORDER_LAST_ACTIVITY: { type: DataTypes.DATE },
    DRAFT_ORDER_IS_ACTIVE: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...AuditMixin('DRAFT_ORDER'),
  }, {
    schema: 'SMFB',
    tableName: 'DRAFT_ORDER',
    timestamps: false
  });

  // 🔹 Hooks
  DRAFT_ORDER.beforeCreate((draft, options) => {
    const userId = options.userId || draft._userId || 'SYSTEM';
    draft.DRAFT_ORDER_CREATED_BY = userId;
    draft.DRAFT_ORDER_CREATED_ON = new Date();
    draft.DRAFT_ORDER_LAST_ACTIVITY = new Date();
    if (draft.DRAFT_ORDER_IS_ACTIVE == null) draft.DRAFT_ORDER_IS_ACTIVE = true;
    draft._userId = userId;
  });

  DRAFT_ORDER.beforeUpdate((draft, options) => {
    const userId = options.userId || draft._userId || 'SYSTEM';
    draft.DRAFT_ORDER_MODIFIED_BY = userId;
    draft.DRAFT_ORDER_MODIFIED_ON = new Date();
    draft.DRAFT_ORDER_LAST_ACTIVITY = new Date();
    draft._userId = userId;
  });

  return DRAFT_ORDER;
};