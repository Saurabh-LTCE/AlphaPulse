const express = require("express");

const { buildPaymentOrder, verifyPayment } = require("../services/paymentService");

const router = express.Router();

router.post("/create-order", (req, res) => {
  try {
    const result = buildPaymentOrder(req.body || {});

    if (!result.ok) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }

    // Future Razorpay UPI QR flow:
    // 1. Create a real Razorpay order for the requested amount.
    // 2. Generate a UPI QR payload or payment link from the order.
    // 3. Persist the order reference before exposing the QR to the UI.
    // 4. Return the QR metadata, order id, and expiry details to the frontend.
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      integration: result.integration,
      order: result.order,
    });
  } catch (error) {
    console.error("Failed to build payment order:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to prepare payment order",
    });
  }
});

router.post("/verify", (req, res) => {
  try {
    const result = verifyPayment(req.body || {});

    // Future Razorpay verification flow:
    // 1. Validate the Razorpay signature using the secret stored in env.
    // 2. Confirm the captured payment against the stored order reference.
    // 3. Mark the payment as successful only after signature validation passes.
    // 4. Notify the frontend or webhook consumer with the verified status.
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      integration: result.integration,
      verification: result.verification,
    });
  } catch (error) {
    console.error("Failed to verify payment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
});

module.exports = router;