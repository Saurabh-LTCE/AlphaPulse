const express = require("express");
const router = express.Router();
const {
  getWatchlist,
  getQuotesBySymbols,
} = require("../Controllers/stockController");
router.get("/watchlist", getWatchlist);
router.get("/quotes", getQuotesBySymbols);
module.exports = router;
