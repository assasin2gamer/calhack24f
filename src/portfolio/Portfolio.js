import { useState, useEffect } from "react";
import { auth, db, database } from "../login/firebase"; // Import Firebase config
import { useAuthState } from "react-firebase-hooks/auth";
import { useSignInWithGoogle } from "react-firebase-hooks/auth"; // Firebase Google Sign-In Hook
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import CumulativeStockValueChart from "./components/cumalative"; // Chart component
// import "./portfolio.css"; // Import CSS file
import { signOut } from "firebase/auth"; // Import signOut function
import PortfolioTotalValueChart from "./components/total";
const cryptoList = [
  "btcusd",
  "ethusd",
  "ltcusd",
  "xrpusd",
  "adausd",
  "bnbusd",
  "dotusd",
  "linkusd",
  "dogeusd",
  "solusd",
  "maticusd",
  "uniusd",
];

function Portfolio() {
  const [stocks, setStocks] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [user] = useAuthState(auth);
  const [signInWithGoogle] = useSignInWithGoogle(auth); // Use sign-in with Google hook
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    } else {
      const fetchPortfolio = async () => {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setStocks(docSnap.data().stocks || []);
        }
      };
      fetchPortfolio();
    }
  }, [user, navigate]);

  const handleInputChange = (value) => {
    setNewTicker(value);
    const filteredSuggestions = cryptoList.filter((crypto) =>
      crypto.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions.slice(0, 5));
  };

  const addCrypto = async (e) => {
    e.preventDefault();
    if (
      newTicker &&
      newQuantity &&
      cryptoList.includes(newTicker.toLowerCase())
    ) {
      const ticker = newTicker.toLowerCase();
      const quantity = parseInt(newQuantity);
      const newStock = { ticker, quantity };

      setStocks((prevStocks) => [...prevStocks, newStock]);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userRef, {
            stocks: arrayUnion(newStock),
          });
        } catch (error) {
          await setDoc(userRef, { stocks: [newStock] });
        }
      }

      setNewTicker("");
      setNewQuantity("");
      setSuggestions([]);
    } else {
      alert("Invalid cryptocurrency or quantity");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/path/to/logo.png" alt="Logo" className="h-8 mr-4" />
          <h1 className="text-xl text-gray-800 font-bold">MyCryptoApp</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                type="submit"
                onClick={() => navigate("/code")}
                className="bg-blue-500 text-white py-2 px-4 rounded "
              >
                Code
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className=" flex">
        {/* Left Sidebar */}
        <div className="w-1/4 p-4 bg-white shadow-md overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Ticker</h2>
          <form onSubmit={addCrypto} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a stock"
                value={newTicker}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {suggestions.length > 0 && (
                <ul className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg"
                      onClick={() => {
                        setNewTicker(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion.toUpperCase()}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="number"
              placeholder="Quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Add to Portfolio
            </button>
          </form>
        </div>

        {/* Main Center Graph */}
        <div className="w-2/4 p-4 bg-white shadow-md overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Total Portfolio Value
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-lg h-[calc(100%-2rem)]">
            {console.log(stocks)}
            <PortfolioTotalValueChart stocks={stocks} />
          </div>
        </div>

        {/* Right Sidebar with small graphs */}
        <div className="w-1/4 p-4 bg-white shadow-md overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Your Portfolio
          </h2>
          <div className="flex-grow overflow-y-auto">
            {stocks.map((stock) => (
              <div
                key={stock.ticker}
                className="bg-gray-100 p-4 rounded-lg shadow mb-4"
              >
                <h3 className="text-lg font-bold text-gray-800">
                  {stock.ticker.toUpperCase()}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {cryptoPrices[stock.ticker]?.toFixed(2)}
                  </span>
                  <CumulativeStockValueChart ticker={stock.ticker} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
