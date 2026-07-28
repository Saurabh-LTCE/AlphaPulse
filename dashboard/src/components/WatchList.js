import React, { useContext, useEffect, useRef, useState } from "react";

import GeneralContext from "./GeneralContext";

import { Grow, Tooltip } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { DoughnutChart } from "./DoughnoutChart";
import { getWatchList } from "../services/stockservice";

const formatPercent = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00%";
  }

  return `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(2)}%`;
};

const toWatchListItem = (stock) => ({
  symbol: stock.symbol,
  name: String(stock.symbol || "").replace(/\.NS$/i, ""),
  price: Number(stock.regularMarketPrice ?? 0),
  percent: formatPercent(stock.regularMarketChangePercent),
  isDown: Number(stock.regularMarketChangePercent) < 0,
});

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestLockRef = useRef(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadWatchList = async () => {
      if (requestLockRef.current) {
        return;
      }

      requestLockRef.current = true;

      if (!initialLoadRef.current) {
        setLoading(true);
      }

      try {
        const liveWatchList = await getWatchList();
        const safeWatchList = Array.isArray(liveWatchList) ? liveWatchList : [];

        if (isMounted) {
          setWatchlist(safeWatchList.map(toWatchListItem));
        }
      } catch (error) {
        console.error("Failed to load watchlist:", error);
        if (isMounted) {
          setWatchlist([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }

        initialLoadRef.current = true;
        requestLockRef.current = false;
      }
    };

    loadWatchList();
    const intervalId = setInterval(loadWatchList, 60000);
    const handlePortfolioUpdate = () => {
      loadWatchList();
    };

    window.addEventListener("portfolio-updated", handlePortfolioUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("portfolio-updated", handlePortfolioUpdate);
    };
  }, []);

  const labels = watchlist.map((stock) => stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // export const data = {
  //   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  // datasets: [
  //   {
  //     label: "# of Votes",
  //     data: [12, 19, 3, 5, 2, 3],
  //     backgroundColor: [
  //       "rgba(255, 99, 132, 0.2)",
  //       "rgba(54, 162, 235, 0.2)",
  //       "rgba(255, 206, 86, 0.2)",
  //       "rgba(75, 192, 192, 0.2)",
  //       "rgba(153, 102, 255, 0.2)",
  //       "rgba(255, 159, 64, 0.2)",
  //     ],
  //     borderColor: [
  //       "rgba(255, 99, 132, 1)",
  //       "rgba(54, 162, 235, 1)",
  //       "rgba(255, 206, 86, 1)",
  //       "rgba(75, 192, 192, 1)",
  //       "rgba(153, 102, 255, 1)",
  //       "rgba(255, 159, 64, 1)",
  //     ],
  //     borderWidth: 1,
  //   },
  // ],
  // };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      {loading && !watchlist.length ? (
        <div className="watchlist-skeleton-wrap">
          <WatchListSkeleton />
        </div>
      ) : (
        <ul className="list">
          {watchlist.map((stock, index) => {
            return <WatchListItem stock={stock} key={stock.symbol || index} />;
          })}
        </ul>
      )}

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListSkeleton = () => {
  return (
    <ul className="list skeleton-list">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="skeleton-row watchlist-skeleton-row">
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-inline-group">
            <div className="skeleton-block skeleton-chip" />
            <div className="skeleton-block skeleton-chip short" />
            <div className="skeleton-block skeleton-chip" />
          </div>
        </li>
      ))}
    </ul>
  );
};

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.symbol || stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};