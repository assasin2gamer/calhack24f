import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../login/firebase"; // Your Firebase configuration
// import "../portfolio.css";  // Import CSS file

const PortfolioTotalValueChart = ({ stocks }) => {
  const [chartData, setChartData] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(5000); // Poll every 5 seconds

  useEffect(() => {
    console.log("Stocks received in PortfolioTotalValueChart:", stocks);

    if (!stocks || stocks.length === 0) {
      console.log("No stocks data available");
      return;
    }

    // Combine stocks with the same ticker
    const combinedStocks = stocks.reduce((acc, stock) => {
      if (acc[stock.ticker]) {
        acc[stock.ticker].quantity += stock.quantity;
      } else {
        acc[stock.ticker] = { ...stock };
      }
      return acc;
    }, {});

    const stockRefs = Object.values(combinedStocks).map((stock) =>
      ref(database, `live-crypto-data/${stock.ticker}`)
    );

    const processStockData = (stockData, quantity) => {
      return Object.entries(stockData).map(([key, data]) => ({
        date: new Date(data.timestamp),
        value: parseFloat(data.price) * quantity,
      }));
    };

    const fetchDataForAllStocks = () => {
      console.log("Fetching data for all stocks");
      const combinedData = {};
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      let completedFetches = 0;

      Object.values(combinedStocks).forEach((stock, index) => {
        const stockRef = stockRefs[index];
        onValue(
          stockRef,
          (snapshot) => {
            const data = snapshot.val();
            console.log(`Data received for ${stock.ticker}:`, data);
            if (data) {
              const processedData = processStockData(data, stock.quantity);
              console.log(`Processed data for ${stock.ticker}:`, processedData);

              processedData.forEach((entry) => {
                const { date, value } = entry;
                if (date > tenMinutesAgo) {
                  const dateString = date.toISOString();
                  if (!combinedData[dateString]) {
                    combinedData[dateString] = {
                      date: date.toLocaleString(),
                      totalValue: 0,
                    };
                  }
                  combinedData[dateString].totalValue += value;
                }
              });
            }

            completedFetches++;
            console.log(
              `Completed fetches: ${completedFetches}/${
                Object.keys(combinedStocks).length
              }`
            );
            if (completedFetches === Object.keys(combinedStocks).length) {
              const sortedData = Object.values(combinedData).sort(
                (a, b) => new Date(a.date) - new Date(b.date)
              );
              console.log("Final chart data:", sortedData);
              if (sortedData.length > 0) {
                setChartData(sortedData);
              } else {
                console.log("No data within the last 10 minutes");
              }
            }
          },
          { onlyOnce: true }
        );
      });
    };

    // Fetch data initially and set up polling
    fetchDataForAllStocks();
    const intervalId = setInterval(fetchDataForAllStocks, pollingInterval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [stocks, pollingInterval]);

  return (
    <div>
      <h3 className="text-lg font-bold">
        Total Portfolio Value (Last 10 Minutes)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />{" "}
          {/* Darker grid to fit dark mode */}
          <XAxis dataKey="date" stroke="#ffffff" />{" "}
          {/* White X-axis for visibility */}
          <YAxis
            scale="log"
            domain={[1, "auto"]} // Set minimum value to 1 for the log scale
            stroke="#ffffff"
            tickFormatter={(tick) => tick.toFixed(2)} // Format ticks
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              borderColor: "#8884d8",
            }}
            formatter={(value) => `$${value.toFixed(2)}`} // Format tooltip values
          />
          <Line
            type="monotone"
            dataKey="totalValue"
            stroke="#ff9800"
            strokeWidth={2}
            dot={false}
          />{" "}
          {/* Orange line with no dots */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioTotalValueChart;
