const express = require("express");
const router = express.Router();
const workflowController = require("../controllers/workflowController");

// 🔹 Update workflow step (approve/reject)
router.post("/update", workflowController.updateWorkflow);
// 🔹 Get workflow status for an order
router.get("/status/:orderId", workflowController.getStatus);
// 🔹 Admin-only soft delete order
router.post("/delete/:orderId", workflowController.deleteOrder);

module.exports = router;