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
    const stockRefs = stocks.map((stock) =>
      ref(database, `live-crypto-data/${stock.ticker}`)
    );

    const processStockData = (stockData, quantity) => {
      return Object.keys(stockData).map((key) => {
        const value = stockData[key].price * quantity;
        return {
          date: new Date(stockData[key].timestamp), // Ensure timestamp is a Date object
          value: value === 0 ? 0.1 : value, // Replace 0 with a small positive number for log scale
        };
      });
    };

    const fetchDataForAllStocks = () => {
      const combinedData = {};
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      stockRefs.forEach((stockRef, index) => {
        const stock = stocks[index];
        onValue(stockRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const processedData = processStockData(data, stock.quantity);

            processedData.forEach((entry) => {
              const { date, value } = entry;
              if (date > tenMinutesAgo) {
                // Only include data from the last 10 minutes
                if (!combinedData[date]) {
                  combinedData[date] = {
                    date: date.toLocaleString(),
                    totalValue: 0,
                  };
                }
                combinedData[date].totalValue += value;
              }
            });
          }

          // Set the aggregated data to state after processing all stocks
          setChartData(Object.values(combinedData));
        });
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
