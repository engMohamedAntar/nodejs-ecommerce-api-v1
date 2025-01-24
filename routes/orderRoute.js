//orderRoute.js
const express = require("express");
const router = express.Router();
const {
  createCashOrder,
  getAllOrders,
  filterOrderForLoggedUser,
  getSpecificOrder,
  ensureOrderOwnership,
  updateOrderToPaid,
  updateOrderToDeliverd,
  createCheckoutSession
} = require("../services/orderService");
const { allowedTo, protect } = require("../services/authService");

router.use(protect);

router.post("/:cartId", allowedTo("user"), createCashOrder);
router.get(
  "/",
  allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  getAllOrders
);
router.get("/:id", ensureOrderOwnership, getSpecificOrder);
router.put('/:id/pay', allowedTo('admin', 'manager'), updateOrderToPaid);
router.put('/:id/deliver',allowedTo('admin', 'manager'), updateOrderToDeliverd);

router.post('/checkoutSession/:cartId', allowedTo('user'), createCheckoutSession)
module.exports = router;
