const { HoldingsModel } = require("../Models/HoldingsModel");
const { PositionsModel } = require("../Models/PositionsModel");
const { OrdersModel } = require("../Models/OrdersModel");

const DEFAULT_PRODUCT = "CNC";

const normalizeSymbol = (symbol) => String(symbol || "").trim().replace(/\.NS$/i, "");

const toPositiveInteger = (value) => {
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
};

const toPositiveNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
};

const buildOrderHistory = async ({ name, qty, price, mode }) => {
  const newOrder = new OrdersModel({
    name,
    qty,
    price,
    mode,
  });

  await newOrder.save();
};

const upsertHoldingForBuy = async ({ name, qty, price }) => {
  const existingHolding = await HoldingsModel.findOne({ name });

  if (!existingHolding) {
    return HoldingsModel.create({
      name,
      qty,
      avg: price,
      price,
      net: "0.00%",
      day: "0.00%",
    });
  }

  const nextQty = existingHolding.qty + qty;
  const nextAvg = ((existingHolding.avg * existingHolding.qty) + (price * qty)) / nextQty;

  existingHolding.qty = nextQty;
  existingHolding.avg = nextAvg;
  existingHolding.price = price;

  return existingHolding.save();
};

const upsertPositionForBuy = async ({ name, qty, price }) => {
  const existingPosition = await PositionsModel.findOne({ name, product: DEFAULT_PRODUCT });

  if (!existingPosition) {
    return PositionsModel.create({
      product: DEFAULT_PRODUCT,
      name,
      qty,
      avg: price,
      price,
      net: "0.00%",
      day: "0.00%",
      isLoss: false,
      realizedPnl: 0,
    });
  }

  const nextQty = existingPosition.qty + qty;
  const nextAvg = ((existingPosition.avg * existingPosition.qty) + (price * qty)) / nextQty;

  existingPosition.qty = nextQty;
  existingPosition.avg = nextAvg;
  existingPosition.price = price;

  return existingPosition.save();
};

const updatePositionForSell = async ({ name, qty, price }) => {
  const existingPosition = await PositionsModel.findOne({ name, product: DEFAULT_PRODUCT });

  if (!existingPosition || existingPosition.qty < qty) {
    return null;
  }

  const realizedPnl = (price - existingPosition.avg) * qty;
  const nextQty = existingPosition.qty - qty;
  const nextRealizedPnl = Number(existingPosition.realizedPnl || 0) + realizedPnl;

  existingPosition.qty = nextQty;
  existingPosition.price = price;
  existingPosition.realizedPnl = nextRealizedPnl;
  existingPosition.isLoss = nextQty > 0 ? nextRealizedPnl < 0 : nextRealizedPnl < 0;

  return existingPosition.save();
};

const updateHoldingForSell = async ({ name, qty, price }) => {
  const existingHolding = await HoldingsModel.findOne({ name });

  if (!existingHolding || existingHolding.qty < qty) {
    return null;
  }

  const nextQty = existingHolding.qty - qty;

  if (nextQty === 0) {
    await HoldingsModel.deleteOne({ _id: existingHolding._id });
    return null;
  }

  existingHolding.qty = nextQty;
  existingHolding.price = price;

  return existingHolding.save();
};

const createTradeHandler = (mode) => async (req, res) => {
  try {
    const rawSymbol = req.body.symbol || req.body.name;
    const name = normalizeSymbol(rawSymbol);
    const qty = toPositiveInteger(req.body.qty);
    const price = toPositiveNumber(req.body.price);

    if (!name || !qty || !price) {
      return res.status(400).json({
        message: "symbol, qty, and price are required",
      });
    }

    if (mode === "BUY") {
      const [holding, position] = await Promise.all([
        upsertHoldingForBuy({ name, qty, price }),
        upsertPositionForBuy({ name, qty, price }),
      ]);

      await buildOrderHistory({ name, qty, price, mode });

      return res.status(200).json({
        message: "Buy order placed successfully",
        holding,
        position,
      });
    }

    const [updatedHolding, updatedPosition] = await Promise.all([
      updateHoldingForSell({ name, qty, price }),
      updatePositionForSell({ name, qty, price }),
    ]);

    if (!updatedPosition) {
      return res.status(400).json({
        message: "Insufficient quantity to sell",
      });
    }

    await buildOrderHistory({ name, qty, price, mode });

    return res.status(200).json({
      message: "Sell order placed successfully",
      holding: updatedHolding,
      position: updatedPosition,
    });
  } catch (error) {
    console.error(`Failed to process ${mode.toLowerCase()} order:`, error);
    return res.status(500).json({
      message: `Failed to process ${mode.toLowerCase()} order`,
    });
  }
};

module.exports = {
  buyOrder: createTradeHandler("BUY"),
  sellOrder: createTradeHandler("SELL"),
};