const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const PRODUCTION_RECORDING = sequelize.define('PRODUCTION_RECORDING', {
    PRODUCTION_RECORDING_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    PRODUCTION_RECORDING_ORDER_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: { tableName: 'PRODUCTION_ORDER', schema: 'SMFB' },
        key: 'PRODUCTION_ORDER_ID'
      },
      onDelete: 'CASCADE'
    },
    PRODUCTION_RECORDING_DATE: {
      type: DataTypes.DATE,
      allowNull: false
    },
    PRODUCTION_RECORDING_QUANTITY: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    PRODUCTION_RECORDING_UNIT: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PRODUCTION_RECORDING_MACHINE_NUMBERS: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PRODUCTION_RECORDING_NOTES: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PRODUCTION_RECORDING_RECORDED_BY: {
        type: DataTypes.STRING(50), // must match USER_ID length
        allowNull: false,
        // references: {
        //     model: { tableName: 'USER', schema: 'SMFB' },
        //     key: 'USER_ID'
        // },
        // onDelete: 'CASCADE'
    },
    PRODUCTION_RECORDING_IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ...AuditMixin('PRODUCTION_RECORDING')
  }, {
    schema: 'SMFB',
    tableName: 'PRODUCTION_RECORDING',
    timestamps: false,
    indexes: [
      {
        fields: ['PRODUCTION_RECORDING_ORDER_ID']
      },
      {
        fields: ['PRODUCTION_RECORDING_DATE']
      }
    ]
  });

  // Hooks
  PRODUCTION_RECORDING.beforeCreate((recording, options) => {
    const userId = options.userId || 'SYSTEM';
    recording.PRODUCTION_RECORDING_CREATED_BY = userId;
    recording.PRODUCTION_RECORDING_CREATED_ON = new Date();
    if (recording.PRODUCTION_RECORDING_IS_ACTIVE == null) {
      recording.PRODUCTION_RECORDING_IS_ACTIVE = true;
    }
    recording._userId = userId;
  });

  PRODUCTION_RECORDING.beforeUpdate((recording, options) => {
    const userId = options.userId || recording._userId || 'SYSTEM';
    recording.PRODUCTION_RECORDING_MODIFIED_BY = userId;
    recording.PRODUCTION_RECORDING_MODIFIED_ON = new Date();
    recording._userId = userId;
  });

  return PRODUCTION_RECORDING;
};