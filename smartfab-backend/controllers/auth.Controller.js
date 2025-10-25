// 📁 controllers/auth.controller.js
const { getUserFromToken } = require("../services/authServices");

// Decrypt auth token and return user info
exports.decryptAuth = async (req,res)=>{
  try{
    const { authToken } = req.body;
    if(!authToken) return res.status(400).json({error:"authToken required"});

    // ✅ Use service to decode token
    const { userID, username, email, role,roleId } = await getUserFromToken(authToken);
    // console.log("🔐 Final User Info:", userID, username, role,roleId);

    // Success response
    return res.status(200).json({success:true,data:{userID,username,email,role,roleId}});
  }catch(err){
    console.error("❌ Server error:",err.message);
    return res.status(500).json({error:err.message});
  }
};