import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

import { getQuoteBySymbol, toYahooSymbol } from "../services/stockservice";

const formatPercent = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00%";
  }

  return `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(2)}%`;
};

const normalizeSymbol = (symbol) => String(symbol || "").replace(/\.(NS|BO)$/i, "");

const safeNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestLockRef = useRef(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadPositions = async () => {
      if (requestLockRef.current) {
        return;
      }

      requestLockRef.current = true;

      if (!initialLoadRef.current) {
        setLoading(true);
      }

      try {
        const positionsResponse = await axios.get("http://localhost:4000/allPositions");
        const positionsData = Array.isArray(positionsResponse.data) ? positionsResponse.data : [];
        const quotePromises = positionsData.map(async (stock) => {
          const quote = await getQuoteBySymbol(toYahooSymbol(stock.name));
          return [normalizeSymbol(stock.name), quote];
        });

        const quoteEntries = await Promise.all(quotePromises);
        const quoteMap = new Map(quoteEntries);

        const livePositions = positionsData.map((stock) => {
          const liveQuote = quoteMap.get(normalizeSymbol(stock.name));
          const livePrice = safeNumber(liveQuote?.regularMarketPrice);
          const investmentValue = safeNumber(stock.avg) * safeNumber(stock.qty);
          const currentValue = livePrice * safeNumber(stock.qty);
          const profitLoss = currentValue - investmentValue;
          const dayPercent = Number(liveQuote?.regularMarketChangePercent ?? 0);

          return {
            ...stock,
            price: livePrice,
            investmentValue,
            currentValue,
            profitLoss,
            dayPercent,
            day: formatPercent(dayPercent),
            isLoss: profitLoss < 0,
          };
        });

        if (isMounted) {
          setPositions(livePositions);
        }
      } catch (error) {
        console.error("Failed to load positions:", error);
        if (isMounted) {
          setPositions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }

        initialLoadRef.current = true;
        requestLockRef.current = false;
      }
    };

    loadPositions();
    const intervalId = setInterval(loadPositions, 60000);
    const handlePortfolioUpdate = () => {
      loadPositions();
    };

    window.addEventListener("portfolio-updated", handlePortfolioUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("portfolio-updated", handlePortfolioUpdate);
    };
  }, []);

  const activePositions = positions.filter((stock) => Number(stock.qty) > 0);

  return (
    <>
      <h3 className="title">Positions ({activePositions.length})</h3>

      {loading && !activePositions.length ? (
        <div className="table-skeleton-wrap">
          <TableSkeleton rows={4} columns={7} />
        </div>
      ) : null}

      <div className="order-table">
        <table>
          <tr>
            <th>Product</th>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&L</th>
            <th>Chg.</th>
          </tr>

          {activePositions.map((stock, index) => {
            const curValue = Number(stock.currentValue ?? stock.price * stock.qty);
            const investmentValue = Number(stock.investmentValue ?? stock.avg * stock.qty);
            const pnl = Number(stock.profitLoss ?? curValue - investmentValue);
            const isProfit = pnl >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = Number(stock.dayPercent) < 0 ? "loss" : "profit";

            return (
              <tr key={stock._id || `${stock.product}-${stock.name}-${index}`}>
                <td>{stock.product}</td>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{safeNumber(stock.price).toFixed(2)}</td>
                <td className={profClass}>
                  {pnl.toFixed(2)}
                </td>
                <td className={dayClass}>{stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
};

export default Positions;

const TableSkeleton = ({ rows, columns }) => {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="table-skeleton-row" key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              className={`skeleton-block table-skeleton-cell ${colIndex === 0 ? "wide" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};