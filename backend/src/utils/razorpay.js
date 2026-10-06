const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in .env");
    }

    razorpayInstance = new Razorpay({
      key_id: keyId || "test_key",
      key_secret: keySecret || "test_secret",
    });
  }
  return razorpayInstance;
};

/**
 * Create a new Razorpay Order for security deposit
 * @param {number} amount - Deposit amount in INR
 * @param {string} receipt - Unique receipt reference string
 * @param {object} notes - Key-value metadata
 */
const createOrder = async (amount, receipt, notes = {}) => {
  const instance = getRazorpayInstance();
  const options = {
    amount: Math.round(Number(amount) * 100), // convert to paise
    currency: "INR",
    receipt: String(receipt).slice(0, 40),
    notes,
  };
  return instance.orders.create(options);
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay payment signature
 * @returns {boolean}
 */
const verifySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

module.exports = {
  getRazorpayInstance,
  createOrder,
  verifySignature,
};
