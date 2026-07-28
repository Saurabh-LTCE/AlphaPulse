const { WATCHLIST_SYMBOLS, fetchStockQuotes, normalizeSymbol } = require("../util/stockService");

const buildStockPayload = (quote, fallbackSymbol) => ({
  symbol: quote?.symbol || fallbackSymbol,
  displayName: quote?.displayName || quote?.symbol || fallbackSymbol,
  regularMarketPrice: Number(quote?.regularMarketPrice ?? 0),
  regularMarketChange: Number(quote?.regularMarketChange ?? 0),
  regularMarketChangePercent: Number(quote?.regularMarketChangePercent ?? 0),
  regularMarketOpen: Number(quote?.regularMarketOpen ?? 0),
  regularMarketDayHigh: Number(quote?.regularMarketDayHigh ?? 0),
  regularMarketDayLow: Number(quote?.regularMarketDayLow ?? 0),
  regularMarketPreviousClose: Number(quote?.regularMarketPreviousClose ?? 0),
});

const sendJsonOnce = (res, statusCode, payload) => {
  if (!res.headersSent) {
    res.status(statusCode).json(payload);
  }
};

const getWatchlist = async (req, res) => {
  try {
    const quotes = await fetchStockQuotes(WATCHLIST_SYMBOLS);
    const payload = WATCHLIST_SYMBOLS.map((symbol) => {
      const normalizedSymbol = normalizeSymbol(symbol);
      const quote = quotes.find((item) => normalizeSymbol(item.symbol) === normalizedSymbol);
      return buildStockPayload(quote, normalizedSymbol);
    });

    sendJsonOnce(res, 200, payload);
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    sendJsonOnce(res, 500, []);
  } finally {
    if (!res.headersSent) {
      sendJsonOnce(res, 200, []);
    }
  }
};

const getQuotesBySymbols = async (req, res) => {
  try {
    const symbols = String(req.query.symbols || "")
      .split(",")
      .map((symbol) => normalizeSymbol(symbol))
      .filter(Boolean);

    if (!symbols.length) {
      sendJsonOnce(res, 200, []);
      return;
    }

    const quotes = await fetchStockQuotes(symbols);
    const payload = symbols.map((symbol) => {
      const quote = quotes.find((item) => normalizeSymbol(item.symbol) === symbol);
      return buildStockPayload(quote, symbol);
    });

    sendJsonOnce(res, 200, payload);
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    sendJsonOnce(res, 500, []);
  } finally {
    if (!res.headersSent) {
      sendJsonOnce(res, 200, []);
    }
  }
};

module.exports = {
  getWatchlist,
  getQuotesBySymbols,
};