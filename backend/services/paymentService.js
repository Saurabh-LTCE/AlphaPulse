const { randomUUID } = require("crypto");

const DEFAULT_CURRENCY = "INR";
const DEFAULT_INTEGRATION = "razorpay-upi-qr";

const toPositiveAmount = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Number(numericValue.toFixed(2));
};

const normalizeReceipt = (receipt) => {
  const value = String(receipt || "").trim();

  if (value) {
    return value;
  }

  return `rcpt_${randomUUID()}`;
};

const buildPaymentOrder = ({ amount, currency = DEFAULT_CURRENCY, receipt, notes = {} }) => {
  const sanitizedAmount = toPositiveAmount(amount);

  if (!sanitizedAmount) {
    return {
      ok: false,
      statusCode: 400,
      message: "amount must be a positive number",
    };
  }

  const orderId = `pay_${randomUUID()}`;

  return {
    ok: true,
    statusCode: 501,
    message: "Payment gateway integration is not enabled yet",
    integration: DEFAULT_INTEGRATION,
    order: {
      id: orderId,
      amount: sanitizedAmount,
      currency: String(currency || DEFAULT_CURRENCY).toUpperCase(),
      receipt: normalizeReceipt(receipt),
      status: "created",
      notes: notes && typeof notes === "object" ? notes : {},
      provider: "razorpay",
      qr: {
        enabled: false,
        data: null,
        expiresAt: null,
      },
    },
  };
};

const verifyPayment = (payload = {}) => {
  const verificationPayload = {
    orderId: payload.razorpay_order_id || payload.orderId || null,
    paymentId: payload.razorpay_payment_id || payload.paymentId || null,
    signature: payload.razorpay_signature || payload.signature || null,
  };

  return {
    ok: false,
    statusCode: 501,
    message: "Payment verification is not enabled yet",
    integration: DEFAULT_INTEGRATION,
    verification: {
      ...verificationPayload,
      verified: false,
      reason: "placeholder-endpoint",
    },
  };
};

module.exports = {
  buildPaymentOrder,
  verifyPayment,
};