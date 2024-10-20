import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ref, onValue } from "firebase/database";
import { database } from "../../login/firebase";  // Your Firebase configuration
import "../portfolio.css";  // Import CSS file

const CumulativeStockValueChart = ({ ticker, totalValue }) => {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null); // State to hold the current price
  const [pollingInterval, setPollingInterval] = useState(5000); // Poll every 5 seconds
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // Fetch chart data from Firebase
  useEffect(() => {
    if (ticker) {
      const stockRef = ref(database, `live-crypto-data/${ticker}`);
      
      // Log whenever data is fetched
      const unsubscribe = onValue(stockRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const processedData = Object.keys(data).map((key) => ({
            date: new Date(data[key].timestamp).toLocaleString(),
            value: data[key].price,
          }));

          // Update current price with the latest price
          const latestPrice = data[Object.keys(data).pop()].price;
          setCurrentPrice(latestPrice);
          setChartData(processedData);
        }
      });

      // Set up polling to fetch the latest data periodically
      const intervalId = setInterval(() => {
        onValue(stockRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const processedData = Object.keys(data).map((key) => ({
              date: new Date(data[key].timestamp).toLocaleString(),
              value: data[key].price,
            }));
            setChartData(processedData);

            const latestPrice = data[Object.keys(data).pop()].price;
            setCurrentPrice(latestPrice);
          }
        });
      }, pollingInterval);

      // Cleanup the listener and interval on component unmount
      return () => {
        unsubscribe();
        clearInterval(intervalId);
      };
    } else if (totalValue) {
      setChartData([{ date: new Date().toLocaleString(), value: totalValue }]);
    }
  }, [ticker, totalValue, pollingInterval]);

  // Function to toggle modal visibility
  const handleChartClick = () => {
    setIsModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Current Price Title */}
      <h3 className="text-lg font-bold">Current Price: ${currentPrice?.toFixed(2) || "Loading..."}</h3>
      
      {/* Clickable Chart that opens in a modal */}
      <div onClick={handleChartClick} style={{ cursor: "pointer" }}>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#ffffff" />
            <YAxis domain={['auto', 'auto']} stroke="#ffffff" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#8884d8' }} />
            <Line type="monotone" dataKey="value" stroke="#ff9800" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Modal to show enlarged chart */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal} style={overlayStyles}>
          <div className="modal-content" style={modalStyles} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseModal} style={closeButtonStyles}>Close</button>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#ffffff" />
                <YAxis domain={['auto', 'auto']} stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#8884d8' }} />
                <Line type="monotone" dataKey="value" stroke="#ff9800" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles for the modal
const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyles = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '80%',
  height: 'auto',
  maxWidth: '900px',
  zIndex: 1001,
};

const closeButtonStyles = {
  position: 'absolute',
  top: '10px',
  right: '20px',
  backgroundColor: 'red',
  color: '#fff',
  border: 'none',
  padding: '10px',
  cursor: 'pointer',
  borderRadius: '5px',
};

export default CumulativeStockValueChart;
