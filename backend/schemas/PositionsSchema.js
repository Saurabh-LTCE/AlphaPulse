const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  product: String,
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
  realizedPnl: {
    type: Number,
    default: 0,
  },
});

module.exports = { PositionsSchema };