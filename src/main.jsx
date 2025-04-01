import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { initializeAESKey } from "./services/CryptoUtils";
import './index.css';
import App from "./App";

function Root() {
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);

  useEffect(() => {
    async function fetchKey() {
      try {
        await initializeAESKey();
        setIsKeyLoaded(true);
      } catch (error) {
        console.error("Failed to initialize AES key:", error);
      }
    }

    fetchKey();
  }, []);

  if (!isKeyLoaded) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);


