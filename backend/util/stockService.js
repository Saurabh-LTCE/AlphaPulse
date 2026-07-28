const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();

const CACHE_TTL_MS = 60 * 1000;

const WATCHLIST_SYMBOLS = [
    "INFY.NS",
    "TCS.NS",
    "RELIANCE.NS",
    "SBIN.NS",
    "WIPRO.NS",
    "HDFCBANK.NS",
    "BHARTIARTL.NS",
    "ITC.NS",
    "TATAPOWER.NS",
    "HINDUNILVR.NS",
    "ONGC.NS",
];

const quoteCache = new Map();
const pendingQuoteRequests = new Map();

const toNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeSymbol = (symbol) => String(symbol || "").trim();

const normalizeStockQuote = (rawQuote, fallbackSymbol) => ({
    symbol: rawQuote?.symbol || fallbackSymbol,
    displayName:
        rawQuote?.shortName || rawQuote?.longName || rawQuote?.displayName || fallbackSymbol,
    regularMarketPrice: toNumber(rawQuote?.regularMarketPrice),
    regularMarketChange: toNumber(rawQuote?.regularMarketChange),
    regularMarketChangePercent: toNumber(rawQuote?.regularMarketChangePercent),
    regularMarketOpen: toNumber(rawQuote?.regularMarketOpen),
    regularMarketDayHigh: toNumber(rawQuote?.regularMarketDayHigh),
    regularMarketDayLow: toNumber(rawQuote?.regularMarketDayLow),
    regularMarketPreviousClose: toNumber(rawQuote?.regularMarketPreviousClose),
});

const fetchSingleQuote = async (symbol) => {
    const cleanSymbol = normalizeSymbol(symbol);

    if (!cleanSymbol) {
        return null;
    }

    const cachedQuote = quoteCache.get(cleanSymbol);
    const isCacheFresh =
        cachedQuote && Date.now() - cachedQuote.fetchedAt < CACHE_TTL_MS;

    if (isCacheFresh) {
        return cachedQuote.data;
    }

    if (pendingQuoteRequests.has(cleanSymbol)) {
        return pendingQuoteRequests.get(cleanSymbol);
    }

    const requestPromise = (async () => {
        try {
            const rawQuote = await yahooFinance.quote(cleanSymbol);
            const normalizedQuote = normalizeStockQuote(rawQuote, cleanSymbol);

            quoteCache.set(cleanSymbol, {
                data: normalizedQuote,
                fetchedAt: Date.now(),
            });

            return normalizedQuote;
        } catch (error) {
            if (cachedQuote?.data) {
                return cachedQuote.data;
            }

            console.error(`Failed to fetch quote for ${cleanSymbol}:`, error.message);
            return null;
        } finally {
            pendingQuoteRequests.delete(cleanSymbol);
        }
    })();

    pendingQuoteRequests.set(cleanSymbol, requestPromise);
    return requestPromise;
};

const fetchStockQuotes = async (symbols = []) => {
    const uniqueSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];

    const quotePromises = uniqueSymbols.map(async (symbol) => {
        try {
            return await fetchSingleQuote(symbol);
        } catch (error) {
            console.error(`Unexpected failure for ${symbol}:`, error.message);
            return null;
        }
    });

    const quotes = await Promise.all(quotePromises);
    return quotes.filter(Boolean);
};

module.exports = {
    WATCHLIST_SYMBOLS,
    fetchStockQuotes,
    normalizeSymbol,
    normalizeStockQuote,
};