import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { VerticalGraph } from "./VerticalGraph";
import { getQuotesBySymbols, toYahooSymbol } from "../services/stockservice";

const formatPercent = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00%";
  }

  return `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(2)}%`;
};

const normalizeSymbol = (symbol) => String(symbol || "").replace(/\.(NS|BO)$/i, "");

const sumPortfolioValues = (items, selector) =>
  items.reduce((sum, item) => sum + Number(selector(item)), 0);

const safeNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestLockRef = useRef(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadHoldings = async () => {
      if (requestLockRef.current) {
        return;
      }

      requestLockRef.current = true;

      if (!initialLoadRef.current) {
        setLoading(true);
      }

      try {
        const holdingsResponse = await axios.get("http://localhost:4000/allHoldings");
        const holdingsData = Array.isArray(holdingsResponse.data) ? holdingsResponse.data : [];
        const quoteSymbols = holdingsData.map((stock) => toYahooSymbol(stock.name));
        const quotes = await getQuotesBySymbols(quoteSymbols);
        const safeQuotes = Array.isArray(quotes) ? quotes : [];
        const quoteMap = new Map(
          safeQuotes.map((quote) => [normalizeSymbol(quote.symbol), quote])
        );

        const liveHoldings = holdingsData.map((stock) => {
          const liveQuote = quoteMap.get(stock.name);
          const livePrice = safeNumber(liveQuote?.regularMarketPrice);
          const investmentValue = safeNumber(stock.avg) * safeNumber(stock.qty);
          const currentValue = livePrice * Number(stock.qty || 0);
          const profitLoss = currentValue - investmentValue;
          const netPercent = investmentValue ? (profitLoss / investmentValue) * 100 : 0;
          const dayPercent = Number(liveQuote?.regularMarketChangePercent ?? 0);

          return {
            ...stock,
            price: livePrice,
            investmentValue,
            currentValue,
            profitLoss,
            netPercent,
            dayPercent,
            net: formatPercent(netPercent),
            day: formatPercent(dayPercent),
            isLoss: profitLoss < 0,
          };
        });

        if (isMounted) {
          setAllHoldings(liveHoldings);
        }
      } catch (error) {
        console.error("Failed to load holdings:", error);
        if (isMounted) {
          setAllHoldings([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }

        initialLoadRef.current = true;
        requestLockRef.current = false;
      }
    };

    loadHoldings();
    const intervalId = setInterval(loadHoldings, 60000);
    const handlePortfolioUpdate = () => {
      loadHoldings();
    };

    window.addEventListener("portfolio-updated", handlePortfolioUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("portfolio-updated", handlePortfolioUpdate);
    };
  }, []);

  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      {loading && !allHoldings.length ? (
        <div className="table-skeleton-wrap">
          <TableSkeleton rows={6} columns={8} />
        </div>
      ) : null}

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>

          {allHoldings.map((stock, index) => {
            const curValue = safeNumber(stock.currentValue ?? stock.price * stock.qty);
            const investmentValue = safeNumber(stock.investmentValue ?? stock.avg * stock.qty);
            const pnl = safeNumber(stock.profitLoss ?? curValue - investmentValue);
            const isProfit = pnl >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = Number(stock.dayPercent) < 0 ? "loss" : "profit";

            return (
              <tr key={stock._id || stock.name || index}>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{safeNumber(stock.price).toFixed(2)}</td>
                <td>{curValue.toFixed(2)}</td>
                <td className={profClass}>
                  {pnl.toFixed(2)}
                </td>
                <td className={profClass}>{stock.net}</td>
                <td className={dayClass}>{stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>{sumPortfolioValues(allHoldings, (stock) => stock.investmentValue ?? safeNumber(stock.avg) * safeNumber(stock.qty)).toFixed(2)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>{sumPortfolioValues(allHoldings, (stock) => stock.currentValue ?? safeNumber(stock.price) * safeNumber(stock.qty)).toFixed(2)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5>
            {(() => {
              const totalInvestment = sumPortfolioValues(
                allHoldings,
                (stock) => stock.investmentValue ?? safeNumber(stock.avg) * safeNumber(stock.qty)
              );
              const totalCurrent = sumPortfolioValues(
                allHoldings,
                (stock) => stock.currentValue ?? safeNumber(stock.price) * safeNumber(stock.qty)
              );
              const totalPnl = totalCurrent - totalInvestment;
              const totalPercent = totalInvestment ? (totalPnl / totalInvestment) * 100 : 0;

              return `${totalPnl.toFixed(2)} (${formatPercent(totalPercent)})`;
            })()}
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;

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