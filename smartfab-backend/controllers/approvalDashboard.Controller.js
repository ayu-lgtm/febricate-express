// Import services
const approvalDashboardService = require('../services/approvalDashboardService');
const { getUserFromToken } = require("../services/authServices"); // Token utility

// Extract user info from token
const extractUser = async (req) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  const { userID, username, email, role } = await getUserFromToken(token);
  return { userId:userID, username, email, role };
};

// Get dashboard data
exports.getDashboardData = async (req,res)=>{
  try{
    const user=await extractUser(req);
    const filters={
      searchTerm:req.query.searchTerm,
      selectedSPC:req.query.selectedSPC,
      selectedStatus:req.query.selectedStatus,
      selectedCustomer:req.query.selectedCustomer,
      selectedOrderType:req.query.selectedOrderType,
      selectedVehicleType:req.query.selectedVehicleType,
      selectedMeshType:req.query.selectedMeshType,
      startDate:req.query.startDate,
      endDate:req.query.endDate,
      selectedUserId:req.query.selectedUserId,
      showAllUsers:req.query.showAllUsers==='true'
    };
    const result=await approvalDashboardService.getDashboardData(user,filters);
    res.json({success:true,data:result});
  }catch(err){
    console.error("Error fetching dashboard data:",err);
    res.status(500).json({success:false,message:err.message||"Internal server error"});
  }
};

// Approve order
exports.approveOrder = async (req,res)=>{
  try{
    const user=await extractUser(req);
    const {orderId}=req.params;
    const result=await approvalDashboardService.approveOrder(orderId,user);
    res.json({success:true,data:result});
  }catch(err){
    res.status(500).json({success:false,message:err.message});
  }
};

// Return order
exports.returnOrder = async (req,res)=>{
  try{
    const user=await extractUser(req);
    const {orderId}=req.params;
    const {remarks}=req.body;
    if(!remarks) return res.status(400).json({success:false,message:"Remarks are required"});
    const result=await approvalDashboardService.returnOrder(orderId,remarks,user);
    res.json({success:true,data:result});
  }catch(err){
    res.status(500).json({success:false,message:err.message});
  }
};

// Delete order
exports.deleteOrder = async (req,res)=>{
  try{
    const user=await extractUser(req);
    const {orderId}=req.params;
    const result=await approvalDashboardService.deleteOrder(orderId,user);
    res.json({success:true,data:result});
  }catch(err){
    res.status(500).json({success:false,message:err.message});
  }
};

// Get order details
exports.getOrderDetails = async (req,res)=>{
  try{
    const user=await extractUser(req);
    const {orderId}=req.params;
    const result=await approvalDashboardService.getOrderDetails(orderId,user);
    res.json({success:true,data:result});
  }catch(err){
    res.status(500).json({success:false,message:err.message});
  }
};