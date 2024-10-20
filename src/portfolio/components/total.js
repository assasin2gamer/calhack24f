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

const PortfolioTotalValueChart = ({ stocks }) => {
  const [chartData, setChartData] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(5000); // Poll every 5 seconds

  // Function to normalize data from Firebase and convert to a consistent format
  const normalizeData = (stockData, quantity) => {
    return Object.entries(stockData).map(([key, data]) => ({
      date: new Date(data.timestamp), // Assume 'timestamp' field exists
      value: parseFloat(data.price) * quantity, // Multiply price by quantity to get total value
    }));
  };

  useEffect(() => {
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

    const fetchDataForAllStocks = () => {
      const allStockData = [];
      let completedFetches = 0;
      const totalStocks = Object.values(combinedStocks).length;

      Object.values(combinedStocks).forEach((stock) => {
        const stockRef = ref(database, `live-crypto-data/${stock.ticker}`);
        const quantity = stock.quantity;

        onValue(stockRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const processedData = normalizeData(data, quantity);
            allStockData.push(processedData);
          }
          completedFetches++;

          // Once all stocks have been fetched
          if (completedFetches === totalStocks) {
            // Combine all stock data by summing values
            const totalValueData = allStockData.reduce((acc, stockArray) => {
              return stockArray.map((dataPoint, index) => {
                if (!acc[index]) {
                  acc[index] = { date: dataPoint.date, totalValue: 0 };
                }
                acc[index].totalValue += dataPoint.value;
                return acc[index];
              });
            }, []);

            setChartData(totalValueData);
          }
        });
      });
    };

    // Fetch data initially and set up polling
    fetchDataForAllStocks();
    const intervalId = setInterval(fetchDataForAllStocks, pollingInterval);

    return () => clearInterval(intervalId);
  }, [stocks, pollingInterval]);

  return (
    <div>
      <h3 className="text-lg font-bold">Total Portfolio Value (Last 10 Minutes)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#ffffff" />
          <YAxis
            domain={["auto", "auto"]} // Use auto domain for Y-axis scaling
            stroke="#ffffff"
            tickFormatter={(tick) => tick.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              borderColor: "#8884d8",
            }}
            formatter={(value) => `$${value.toFixed(2)}`}
          />
          <Line
            type="monotone" // Monotone for smooth line rendering
            dataKey="totalValue"
            stroke="#ff9800"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioTotalValueChart;
