const express = require("express");

const { buyOrder, sellOrder } = require("../Controllers/orderController");

const router = express.Router();

router.post("/buy", buyOrder);
router.post("/sell", sellOrder);

module.exports = router;