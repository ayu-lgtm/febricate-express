// 📁 controllers/workflowController.js
const workflowService = require("../services/approvalDashboardService");


/**
 * 🔹 Update workflow (approve/reject)
 */
async function updateWorkflow(req, res) {
  try {
    // ⬅️ add targetLevel here
    const { orderId, userId, roleId, action, remarks, targetLevel } = req.body;

    // 🔹 Strict validation
    if (!orderId || !userId || !roleId || !action) {
      return res.status(400).json({
        error: "orderId, userId, roleId and action are required",
      });
    }

    // 🔹 Ensure valid action
    if (!["APPROVE", "REJECT", "RETURN"].includes(action)) {
      return res.status(400).json({
        error: "Invalid action. Must be APPROVE, REJECT or RETURN",
      });
    }

    // 🔹 Pass everything to service, including targetLevel
    const result = await workflowService.handleApproval({
      orderId,
      roleId,
      userId,
      action,
      remarks,
      targetLevel, // <— FIX HERE
    });

    return res.status(200).json({
      message: `Workflow ${action === "APPROVE" ? "approved" : action === "RETURN" ? "returned" : "rejected"} successfully`,
      order: result,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to update workflow",
      details: err.message,
    });
  }
}
/**
 * 🔹 Get order status including workflow details
 */
async function getStatus(req, res) {
    try {
        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ error: "orderId is required" });

        const result = await workflowService.getOrderHistory(orderId);
        return res.status(200).json({
            message: "Order status fetched successfully",
            status: result
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch order status",
            details: err.message
        });
    }
}
/**
 * 🔹 Admin-only soft delete order
 */
async function deleteOrder(req, res) {
    try {
        const { orderId } = req.params;
        const adminUserId = req.headers["x-user-id"];
        if (!orderId) return res.status(400).json({ error: "orderId is required" });
        if (!adminUserId) return res.status(403).json({ error: "Admin userId is required" });

        const result = await workflowService.deleteOrder(orderId, adminUserId);
        const status = await workflowService.getOrderStatusMap(); // <- no orderId here
        return res.status(200).json({
            message: result.message,
            status,
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to delete order",
            details: err.message,
        });
    }
}

module.exports = { 
  updateWorkflow, getStatus,
    deleteOrder, };