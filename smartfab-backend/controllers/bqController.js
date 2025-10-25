// 📁 controllers/bq.controller.js
const { getCityCodes,getRawMaterials,getFGMaterials,isFreightMaintainedFromBQ ,getFreightDetailsFromBQ} = require("../services/bqService");
const { getMaterialMappings } = require("../services/orderService");

// 🔧 Normalize material code (remove leading zeros & decimals)
const normalizeCode = (code)=>{
  if(!code) return "";
  if(typeof code==="number") return code.toString().replace(/.0+$/,"");
  return code.toString().replace(/^0+/,"").replace(/.0+$/,"");
};

// 🌐 GET city codes
exports.handleGetCityCodes = async (req,res)=>{
  try{
    const data=await getCityCodes();
    res.json({success:true,data});
  }catch(err){
    console.error("❌ Error fetching city codes:",err.message);
    res.status(500).json({success:false,error:"Failed to fetch city codes"});
  }
};

// 🌐 GET raw materials (with alias mapping)
exports.handleGetRawMaterials = async (req,res)=>{
  try{
    const bqMaterials=await getRawMaterials();
    // console.log(bqMaterials)
    // console.log("---------------------------------")

    const mappings=await getMaterialMappings();
    // console.log(mappings)
    // console.log("---------------------------------")

    const aliasMap=new Map(mappings.map(item=>[
      normalizeCode(item.MATERIAL_MAPPING_ID),
      item.MATERIAL_MAPPING_ALIAS||item.MATERIAL_MAPPING_DESCRIPTION
    ]));

    //   console.log(aliasMap)
    // console.log("---------------------------------")
    const matched=bqMaterials
      .filter(item=>aliasMap.has(normalizeCode(item.MATNR)))
      .map(item=>({...item,
        description:aliasMap.get(normalizeCode(item.MATNR)),
        originalDescription:item.MAKTX
      }));
    res.json({success:true,data:matched});
  }catch(err){
    console.error("❌ Error comparing material mapping:",err.message);
    res.status(500).json({success:false,error:"Failed to compare material mappings"});
  }
};

// 🌐 GET FG materials
exports.handleGetFGMaterials = async (req,res)=>{
  try{
    const data=await getFGMaterials();
    res.json({success:true,data});
  }catch(err){
    console.error("❌ Error fetching FG materials:",err.message);
    res.status(500).json({success:false,error:"Failed to fetch FG materials"});
  }
};

// 🌐 POST check freight status
// exports.handleCheckFreight = async (req,res)=>{
//   try{
//     const { spcName,city,vehicleType }=req.body;
//     if(!spcName||!city||!vehicleType)
//       return res.status(400).json({success:false,error:"Missing required parameters: spcName, city, vehicleType"});
//     const werks=spcName.split("-")[0]||"";
//     const cityc=city.split("-")[0]||"";
//     const traty=vehicleType||"";
//     const isMaintained=await isFreightMaintainedFromBQ(werks,cityc,traty);
//     res.json({success:true,data:{freightMaintained:isMaintained?"Yes":"No",queryParamsUsed:{werks,cityc,traty}}});
//   }catch(err){
//     console.error("❌ Freight check error:",err.message);
//     res.status(500).json({success:false,error:"Failed to check freight status",details:err.message});
//   }
// };

// 🌐 POST check freight status (UPDATED)
exports.handleCheckFreight = async (req, res) => {
  try {
    const { spcName, city, vehicleType } = req.body;
    
    if (!spcName || !city || !vehicleType) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: spcName, city, vehicleType"
      });
    }
    
    const werks = spcName.split("-")[0] || "";
    const cityc = city.split("-")[0] || "";
    const traty = vehicleType || "";
    
    // Get freight details including PO number and standard rate
    const freightDetails = await getFreightDetailsFromBQ(werks, cityc, traty);
    
    res.json({
      success: true,
      data: {
        freightMaintained: freightDetails.freightMaintained,
        freightPoNumber: freightDetails.freightPoNumber,
        freightStdRate: freightDetails.freightStdRate,
        queryParamsUsed: { werks, cityc, traty }
      }
    });
    
  } catch (err) {
    console.error("❌ Freight check error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to check freight status",
      details: err.message
    });
  }
};