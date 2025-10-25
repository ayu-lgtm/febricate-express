// services/costCalculationService.js
const { ConversionCharge, RMFreight, TransferPrice } = require('../models');

// Material code se details derive karo
exports.deriveDetailsFromMaterial = (materialCode) => {
    
  const parts = materialCode.split('_');
  
  if (parts.length < 2) {
    throw new Error('Invalid material code format');
  }

  const firstChar = parts[0].charAt(0).toUpperCase();
  let materialType, wireType;
  
  switch(firstChar) {
    case 'M':
      materialType = 'WIRE_ROD';
      wireType = 'AIRCOOLED';
      break;
    case 'T':
      materialType = 'TMT';
      wireType = 'TMT';
      break;
    case 'A':
      materialType = 'AIRCOOLED';
      wireType = 'AIRCOOLED';
      break;
    default:
      throw new Error(`Unknown material type prefix: "${firstChar}" in code "${materialCode}"`);
  }

  const dimensionPart = parts[1];
  const dimensionMatch = dimensionPart.match(/(\d+\.?\d*)X(\d+\.?\d*)/);

  if (!dimensionMatch || !dimensionMatch[1]) {
    throw new Error(`Cannot extract dimensions from: "${dimensionPart}" in code "${materialCode}"`);
  }
  let dimension = 0;
  let section = '6-7mm';
  
  if (dimensionMatch && dimensionMatch[1]) {
    dimension = parseFloat(dimensionMatch[1]);
    
    if (dimension >= 2 && dimension < 3) section = '2-3mm';
    else if (dimension >= 3 && dimension < 4) section = '3-4mm';
    else if (dimension >= 4 && dimension < 5) section = '4-5mm';
    else if (dimension >= 5 && dimension < 6) section = '5-6mm';
    else if (dimension >= 6 && dimension < 7) section = '6-7mm';
    else if (dimension >= 7 && dimension < 8) section = '7-8mm';
    else if (dimension >= 8 && dimension < 9) section = '8-9mm';
    else if (dimension >= 9 && dimension < 10) section = '9-10mm';
    else if (dimension >= 10 && dimension < 11) section = '10-11mm';
    else if (dimension >= 11 && dimension <= 12) section = '11-12mm';
  }

  return {
    materialType,
    wireType,
    dimension,
    section,
    rawMaterialType: materialType === 'TMT' ? 'AIRCOOLED' : materialType
  };
};

// Conversion charge fetch karo
exports.getConversionCharge = async (spc, section, wireType) => {
  const charge = await ConversionCharge.findOne({
    where: {
      CONVERSION_CHARGE_SPC: spc,
      CONVERSION_CHARGE_SECTION: section,
      CONVERSION_CHARGE_WIRE_TYPE: wireType
    }
  });
  return charge ? charge.CONVERSION_CHARGE_VALUE : 0;
};

// Get all conversion charges for a specific plant
exports.getConversionChargesByPlant = async (plantCode) => {
  try {
    const charges = await ConversionCharge.findAll({
      where: { 
        CONVERSION_CHARGE_SPC: plantCode 
      },
      order: [
        ['CONVERSION_CHARGE_SECTION', 'ASC'],
        ['CONVERSION_CHARGE_WIRE_TYPE', 'ASC']
      ]
    });
    
    return charges;
  } catch (error) {
    console.error('Error fetching conversion charges by plant:', error);
    throw new Error(`Failed to fetch conversion charges: ${error.message}`);
  }
};

// Freight charges fetch karo
exports.getFreightCharges = async (plant) => {
  const freight = await RMFreight.findOne({
    where: { FREIGHT_PLANT: plant }
  });
  return freight ? {
    firstLeg: freight.FREIGHT_FIRST_LEG,
    secondLeg: freight.FREIGHT_SECOND_LEG,
    total: freight.FREIGHT_FIRST_LEG + freight.FREIGHT_SECOND_LEG
  } : { firstLeg: 0, secondLeg: 0, total: 0 };
};

// Transfer price fetch karo
exports.getTransferPrice = async (month, rmType) => {
  const price = await TransferPrice.findOne({
    where: {
      TRANSFER_PRICE_MONTH: month,
      TRANSFER_PRICE_RM_TYPE: rmType
    }
  });
  return price ? price.TRANSFER_PRICE_VALUE : 0;
};

// TMT ke liye specific size ka price fetch karo
exports.getTMTPrice = async (month, dimension) => {
  let tmtType;
  
  if (dimension >= 6 && dimension < 7) tmtType = 'TMT_6MM';
  else if (dimension >= 8 && dimension < 9) tmtType = 'TMT_8MM';
  else if (dimension >= 10 && dimension < 11) tmtType = 'TMT_10MM';
  else if (dimension >= 12 && dimension <= 13) tmtType = 'TMT_12MM';
  else tmtType = 'TMT_6MM';
  
  return await exports.getTransferPrice(month, tmtType);
};

// Main cost calculation function
exports.calculateProductionCost = async (orderData) => {
  const { 
    materialCode,
    plantCode,
    orderMonth,
    fgDispatchCost = 0
  } = orderData;

  try {
    
    const materialDetails = exports.deriveDetailsFromMaterial(materialCode);
    
    
    let transferPrice;
    if (materialDetails.materialType === 'TMT') {
      transferPrice = await exports.getTMTPrice(orderMonth, materialDetails.dimension);
    } else {
      transferPrice = await exports.getTransferPrice(orderMonth, materialDetails.rawMaterialType);
    }

    const freight = await exports.getFreightCharges(plantCode);
    const conversionCharge = await exports.getConversionCharge(
      plantCode, 
      materialDetails.section, 
      materialDetails.wireType
    );

    const totalCost = transferPrice + freight.total + conversionCharge + fgDispatchCost;

    return {
      materialDetails,
      costBreakdown: {
        a: transferPrice,
        b: freight.total,
        c: conversionCharge,
        d: fgDispatchCost
      },
      detailedBreakdown: {
        transferPrice,
        freight: freight,
        conversionCharge,
        fgDispatchCost,
        totalCost
      },
      totalCost
    };

  } catch (error) {
    console.error('Error in cost calculation:', error);
    throw new Error(`Cost calculation failed: ${error.message}`);
  }
};

// Multiple materials ke liye cost calculate karo
exports.calculateBulkCosts = async (ordersData) => {
  const results = [];
  
  for (const orderData of ordersData) {
    try {
      const cost = await exports.calculateProductionCost(orderData);
      results.push({
        ...orderData,
        costCalculation: cost,
        success: true
      });
    } catch (error) {
      results.push({
        ...orderData,
        costCalculation: null,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
};