// 📁 services/bqService.js
const { BigQuery } = require('@google-cloud/bigquery');
require("dotenv").config();

// Initialize BigQuery client with service account key
const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// console.log(bigquery);

// 1️⃣ Fetch City Codes + Names + Region
async function getCityCodes() {
  const query = `
    SELECT a.CITYC, t.CITY_NAME, t.REGIO
    FROM \`tsl-datalake-prod.SAP_MM.YMT_ROAD_FREIGHT\` a
    JOIN (
      SELECT CITYC, BEZEI AS CITY_NAME, REGIO
      FROM (
        SELECT CITYC, BEZEI, REGIO,
               ROW_NUMBER() OVER (PARTITION BY CITYC ORDER BY SPRAS DESC) AS rn
        FROM \`tsl-datalake-prod.SAP_LO.T005H\`
        WHERE LAND1 = 'IN'
      )
      WHERE rn = 1
    ) t ON a.CITYC = t.CITYC
    GROUP BY a.CITYC, t.CITY_NAME, t.REGIO
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
}

// 2️⃣ Fetch Raw Materials (PCODE = 285, MATKL = 4 or 5)
async function getRawMaterials() {
  const query = `
    SELECT m.MATNR, d.MAKTX
    FROM \`tsl-datalake-prod.SAP_MM.YMT_MATCHAR\` m
    JOIN \`tsl-datalake-prod.SAP_MM.MAKT\` d ON m.MATNR = d.MATNR
    WHERE m.PCODE = '285' AND m.MATKL IN ('4', '5')
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
}

// 3️⃣ Fetch FG Materials (PCODE = 290, MATKL = 109)
async function getFGMaterials() {
  const query = `
    SELECT m.MATNR, d.MAKTX
    FROM \`tsl-datalake-prod.SAP_MM.YMT_MATCHAR\` m
    JOIN \`tsl-datalake-prod.SAP_MM.MAKT\` d ON m.MATNR = d.MATNR
    WHERE m.PCODE = '290' AND m.MATKL = '109'
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
}

// 4️⃣ Check if Freight is Maintained
async function isFreightMaintainedFromBQ(werks, cityc, traty) {
  const query = `
    SELECT 1
    FROM \`tsl-datalake-prod.SAP_MM.YMT_ROAD_FREIGHT\`
    WHERE WERKS = @werks AND CITYC = @cityc AND TRATY = @traty
      AND CURRENT_DATE() <= DATE(VALIDTO)
    LIMIT 1
  `;
  const options = {
    query,
    params: { werks, cityc, traty },
    timeoutMs: 10000, // 10s timeout
  };
  const [rows] = await bigquery.query(options);
  return rows.length > 0;
}

// 4️⃣ Check if Freight is Maintained and get PO Number & Standard Rate
async function getFreightDetailsFromBQ(werks, cityc, traty) {
  const query = `
    SELECT 
      STDRATE as STANDARD_RATE,
      PO as PO_NUMBER
    FROM \`tsl-datalake-prod.SAP_MM.YMT_ROAD_FREIGHT\`
    WHERE WERKS = @werks 
      AND CITYC = @cityc 
      AND TRATY = @traty
      AND CURRENT_DATE() <= DATE(VALIDTO)
    ORDER BY VALIDTO DESC
    LIMIT 1
  `;
  
  const options = {
    query,
    params: { werks, cityc, traty },
    timeoutMs: 10000, // 10s timeout
  };
  
  const [rows] = await bigquery.query(options);
  
  if (rows.length > 0) {
    return {
      freightMaintained: "Yes",
      freightPoNumber: rows[0].PO_NUMBER || "",
      freightStdRate: rows[0].STANDARD_RATE || 0
    };
  } else {
    return {
      freightMaintained: "No",
      freightPoNumber: null,
      freightStdRate: null
    };
  }
}


module.exports = {
  getCityCodes,
  getRawMaterials,
  getFGMaterials,
  isFreightMaintainedFromBQ,
  getFreightDetailsFromBQ,
}