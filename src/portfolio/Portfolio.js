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
    <>
      {/* Navbar */}
      <nav className="navbar bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/path/to/logo.png" alt="Logo" className="h-8 mr-4" />{" "}
          {/* Replace with actual logo */}
          <h1 className="text-xl text-white font-bold ">MyCryptoApp</h1>
        </div>
        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()} // Trigger Google sign-in here
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-1/4 p-4 bg-gray-200 h-full">
          <h2 className="text-xl font-bold mb-4">Add Cryptocurrency</h2>
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
        <div
          className="flex-grow bg-black p-4"
          style={{ width: "50vw", height: "90vh" }}
        >
          <h1 className="text-2xl font-bold text-white mb-4">
            Total Portfolio Value
          </h1>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-96">
            <PortfolioTotalValueChart stocks={stocks} />
          </div>
        </div>

        {/* Right Sidebar with small graphs */}
        <div className="w-1/4 p-4 bg-gray-900 text-white">
          <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
          <div
            className="space-y-4"
            style={{
              maxHeight: "80%",
              overflowY: "auto",
              backgroundColor: "white",
              width: "20vw",
              height: "80%",
              borderRadius: "5px",
            }}
          >
            {stocks.map((stock) => (
              <div
                key={stock.ticker}
                className="bg-gray-800 p-4 rounded shadow"
                style={{
                  background: "grey",
                  borderRadius: "5px",
                  padding: "5px",
                  margin: "auto",
                  width: "15vw",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                <h3 className="text-lg font-bold">
                  {stock.ticker.toUpperCase()}
                </h3>
                <div className="flex justify-between items-center">
                  <span>{cryptoPrices[stock.ticker]?.toFixed(2)}</span>
                  <CumulativeStockValueChart ticker={stock.ticker} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Portfolio;
