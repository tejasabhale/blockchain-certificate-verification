import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Issue from "./pages/Issue";
import Verify from "./pages/Verify";
import { connectWallet } from "./lib/contract";

export default function App() {
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected and listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(() => {});

      const handleAccountsChanged = (accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const { address } = await connectWallet();
      setAccount(address);
    } catch (err) {
      alert(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Header
          account={account}
          onConnect={handleConnectWallet}
          isConnecting={isConnecting}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Issue account={account} onConnect={handleConnectWallet} />}
            />
            <Route path="/verify" element={<Verify />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
