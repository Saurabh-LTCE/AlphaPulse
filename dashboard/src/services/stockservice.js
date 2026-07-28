import axios from "axios";

const stockApi = axios.create({
    baseURL: "http://localhost:4000/api/stocks",
});

export const toYahooSymbol = (symbol) => {
    const normalizedSymbol = String(symbol || "").trim();

    if (!normalizedSymbol) {
        return "";
    }

    if (normalizedSymbol.includes(".")) {
        return normalizedSymbol;
    }

    return `${normalizedSymbol}.NS`;
};

export const getWatchList = async () => {
    const { data } = await stockApi.get("/watchlist");
    return data;
};

export const getQuotesBySymbols = async (symbols = []) => {
    const uniqueSymbols = [...new Set(symbols.map((symbol) => String(symbol || "").trim()).filter(Boolean))];

    if (!uniqueSymbols.length) {
        return [];
    }

    const { data } = await stockApi.get("/quotes", {
        params: {
            symbols: uniqueSymbols.join(","),
        },
    });

    return data;
};

export const getQuoteBySymbol = async (symbol) => {
    const normalizedSymbol = String(symbol || "").trim();

    if (!normalizedSymbol) {
        return null;
    }

    const { data } = await stockApi.get("/quotes", {
        params: {
            symbols: normalizedSymbol,
        },
    });

    return Array.isArray(data) && data.length ? data[0] : null;
};