const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const upload = require("../utils/fileUpload");

// 🔹 Create new order
router.post(
  "/create",
  upload.fields([
    { name: "drawing", maxCount: 1 },
    { name: "poCopy", maxCount: 1 },
  ]),
  orderController.createOrder
);

// 🔹 Update existing order
router.put(
  "/update/:orderId",
  upload.fields([
    { name: "drawing", maxCount: 1 },
    { name: "poCopy", maxCount: 1 },
  ]),
  orderController.updateOrder
);

// 🔹 Get order by ID
router.get("/details/:orderId", orderController.getOrderById);

// 🔹 Check if user can edit order
router.get("/can-edit/:orderId", orderController.canEditOrder);

// 🔹 Get all orders (filters + pagination)
router.get("/all", orderController.getAllOrders);

// 🔹 Get orders by user
router.get("/user/:userId", orderController.getOrdersByUser);

// 🔹 Get orders pending approval by level
router.get("/approval-level/:level", orderController.getOrdersByApprovalLevel);

// 🔹 Get all active orders
router.get("/active", orderController.getActiveOrders);

// 🔹 Fetch SPC plants
router.get("/spc-plants", orderController.getSPCPlants);

// 🔹 Fetch material mappings
router.get("/material-mappings", orderController.getMaterialMappings);

// 🔹 Fetch code values by category
router.get("/code-values/:category", orderController.getCodeValues);

module.exports = router;