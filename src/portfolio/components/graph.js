// src/components/CumulativeStockValueChart.js
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ref, onValue } from "firebase/database";
import { database } from "../../login/firebase";

const CumulativeStockValueChart = ({ ticker }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const stockRef = ref(database, `live-stock-data/${ticker}`);
    onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedData = Object.keys(data).map((key) => ({
          date: new Date(data[key].timestamp),
          value: data[key].price,
        }));
        setChartData(processedData);
      }
    });
  }, [ticker]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CumulativeStockValueChart;
