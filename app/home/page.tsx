"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWallet,
  getTotalPortfolioValue,
  initializeWallet,
  getCryptoHolding,
} from "@/lib/wallet";
import TradingPanel from "@/components/TradingPanel";

export default function HomePage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [wallet, setWallet] = useState(getWallet());
  const [totalValue, setTotalValue] = useState(1000);
  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: number }>(
    {}
  );
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) {
      router.push("/");
    } else {
      setAuthenticated(true);
      initializeWallet();
      const currentWallet = getWallet();
      setWallet(currentWallet);
      fetchCryptoPrices();
    }
  }, [router]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/crypto");
      if (response.ok) {
        const data = await response.json();
        const prices: { [key: string]: number } = {};
        data.forEach((crypto: any) => {
          prices[crypto.id] = crypto.current_price;
          if (crypto.id === "bitcoin") {
            setBitcoinPrice(crypto.current_price);
          }
        });
        setCryptoPrices(prices);
        setCryptoData(data);
        const currentWallet = getWallet();
        setTotalValue(getTotalPortfolioValue(prices));
      }
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
    }
  };

  // Refresh prices and portfolio value every second
  useEffect(() => {
    if (authenticated) {
      // Fetch prices immediately
      fetchCryptoPrices();

      // Then fetch prices every second
      const interval = setInterval(() => {
        fetchCryptoPrices();
        const currentWallet = getWallet();
        setWallet(currentWallet);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [authenticated]);

  // Recalculate total value whenever prices or wallet changes
  useEffect(() => {
    if (Object.keys(cryptoPrices).length > 0) {
      const currentWallet = getWallet();
      const newTotalValue = getTotalPortfolioValue(cryptoPrices);
      setTotalValue(newTotalValue);
      setWallet(currentWallet);
    }
  }, [cryptoPrices]);

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="w-10 h-10 bg-coinbase-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/home"
                  className="text-gray-700 hover:text-coinbase-blue font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/trade"
                  className="text-gray-700 hover:text-coinbase-blue font-medium"
                >
                  Trade
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-coinbase-blue font-medium"
                >
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
                  <span className="text-gray-600 text-sm font-medium">L</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <nav className="space-y-2">
                <Link
                  href="/home"
                  className="flex items-center space-x-3 p-3 bg-coinbase-light-blue text-coinbase-blue rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  href="/trade"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="font-medium">Trade</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">Profile</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Center Content */}
          <main className="lg:col-span-7 space-y-6">
            {/* Balance Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">
                    ${totalValue.toFixed(2)}
                  </h2>
                  <p className="text-gray-600 mt-1 flex items-center space-x-2">
                    <span>
                      ${(totalValue - 1000).toFixed(2)} (
                      {totalValue > 0
                        ? (((totalValue - 1000) / 1000) * 100).toFixed(2)
                        : "0.00"}
                      %) 1D
                    </span>
                    <span className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                      Live
                    </span>
                  </p>
                </div>
                <div className="w-32 h-16 bg-gray-100 rounded"></div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Crypto
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    ${(totalValue - wallet.cash).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updates every second
                  </p>
                </div>
                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Cash
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    ${wallet.cash.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Portfolio
              </h3>
              {Object.keys(wallet.holdings).filter(
                (id) => wallet.holdings[id] > 0
              ).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(wallet.holdings)
                    .filter(([id, amount]) => amount > 0)
                    .map(([cryptoId, amount]) => {
                      const crypto = cryptoData.find((c) => c.id === cryptoId);
                      const price = cryptoPrices[cryptoId] || 0;
                      const value = amount * price;
                      const priceChange =
                        crypto?.price_change_percentage_24h || 0;
                      const isPositive = priceChange >= 0;

                      return (
                        <Link
                          key={cryptoId}
                          href={`/price/${cryptoId}`}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            {crypto?.image ? (
                              <img
                                src={crypto.image}
                                alt={crypto.name || cryptoId}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 text-xs font-semibold">
                                  {cryptoId.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900">
                                  {crypto?.name || cryptoId.toUpperCase()}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {crypto?.symbol?.toUpperCase() || ""}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {amount.toFixed(6)}{" "}
                                  {crypto?.symbol?.toUpperCase() || ""}
                                </span>
                                {priceChange !== 0 && (
                                  <span
                                    className={`text-sm font-medium ${
                                      isPositive
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {isPositive ? "+" : ""}
                                    {priceChange.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                              <span>${value.toFixed(2)}</span>
                              <span className="text-xs text-green-500 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              ${price.toFixed(2)}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">
                    You don't have any crypto holdings yet.
                  </p>
                  <p className="text-sm mb-4">
                    Start building your portfolio by buying your first crypto.
                  </p>
                  <Link
                    href="/trade"
                    className="inline-block bg-coinbase-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Start trading →
                  </Link>
                </div>
              )}
            </div>

            {/* For You Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                For you
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-coinbase-blue text-white rounded-lg p-6 relative">
                  <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-xl font-bold">C</span>
                  </div>
                  <h4 className="font-semibold mb-2">Mark Your Calendar</h4>
                  <p className="text-sm text-white/90">
                    Hear about the next chapter of Coinbase. Live on X 12/17.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-coinbase-blue text-white rounded-lg p-6 relative">
                  <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-xl">$</span>
                  </div>
                  <h4 className="font-semibold mb-2">
                    Access up to $5M instantly
                  </h4>
                  <p className="text-sm text-white/90">
                    Get a USDC loan without selling your crypto.
                  </p>
                </div>
                <div className="bg-coinbase-blue text-white rounded-lg p-6 relative">
                  <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                    <span className="text-coinbase-blue text-xl">🏆</span>
                  </div>
                  <h4 className="font-semibold mb-2">Earn up to $480</h4>
                  <p className="text-sm text-white/90">
                    Invite friends and earn
                  </p>
                </div>
              </div>
            </div>

            {/* Watchlist Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Watchlist
              </h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-coinbase-light-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-coinbase-blue text-2xl">+</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Build your watchlist
                </h4>
                <p className="text-gray-600 mb-4">
                  Keep track of crypto prices by adding assets to your watchlist
                </p>
                <button className="bg-coinbase-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  Add to watchlist
                </button>
              </div>
            </div>
          </main>

          {/* Right Sidebar - Trading Panel */}
          <aside className="lg:col-span-3">
            {bitcoinPrice > 0 ? (
              <TradingPanel
                key={refreshKey}
                cryptoId="bitcoin"
                cryptoName="Bitcoin"
                cryptoSymbol="btc"
                currentPrice={bitcoinPrice}
                onTransactionComplete={() => {
                  const currentWallet = getWallet();
                  setWallet(currentWallet);
                  setTotalValue(getTotalPortfolioValue(cryptoPrices));
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coinbase-blue mx-auto mb-2"></div>
                  <p className="text-sm">Loading trading panel...</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
