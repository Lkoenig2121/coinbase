"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TradingPanel from "@/components/TradingPanel";
import { initializeWallet, getWallet } from "@/lib/wallet";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  image: string;
}

export default function TradePage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("trending");
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) {
      router.push("/");
    } else {
      setAuthenticated(true);
      initializeWallet();
      fetchCryptos();
    }
  }, [router]);

  useEffect(() => {
    // Set default selected crypto to Bitcoin when cryptos load
    if (cryptos.length > 0 && !selectedCrypto) {
      const bitcoin = cryptos.find((c) => c.id === "bitcoin");
      if (bitcoin) {
        setSelectedCrypto(bitcoin);
      } else {
        setSelectedCrypto(cryptos[0]);
      }
    }
  }, [cryptos, selectedCrypto]);

  const fetchCryptos = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/crypto");

      if (!response.ok) {
        throw new Error("Failed to fetch crypto data");
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setCryptos(data);
      } else {
        console.error("Invalid data format:", data);
        setCryptos([]);
      }
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      // Fallback data if API fails
      setCryptos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1) return `$${value.toFixed(2)}`;
    return `$${value.toFixed(4)}`;
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
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
                <Link href="/trade" className="text-coinbase-blue font-medium">
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
              <button className="hidden md:block p-2 text-gray-600 hover:text-gray-900">
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
              <button className="hidden md:block p-2 text-gray-600 hover:text-gray-900 relative">
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

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 md:hidden">
              <nav className="flex flex-col py-4">
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-coinbase-blue font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/trade"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-coinbase-blue hover:bg-gray-50 font-medium transition-colors"
                >
                  Trade
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-coinbase-blue font-medium transition-colors"
                >
                  Profile
                </Link>
              </nav>
            </div>
          </>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <nav className="space-y-2">
                <Link
                  href="/home"
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  href="/trade"
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

          {/* Main Content */}
          <main className="lg:col-span-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Trade</h1>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab("crypto")}
                className={`px-6 py-3 rounded-lg font-medium ${
                  activeTab === "crypto"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setActiveTab("futures")}
                className={`px-6 py-3 rounded-lg font-medium ${
                  activeTab === "futures"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Futures
              </button>
              <button
                onClick={() => setActiveTab("perpetuals")}
                className={`px-6 py-3 rounded-lg font-medium ${
                  activeTab === "perpetuals"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Perpetuals
              </button>
            </div>

            {/* Filters */}
            {activeTab === "crypto" && (
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setFilter("trending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "trending"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setFilter("gainers")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "gainers"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Top gainers
                </button>
                <button
                  onClick={() => setFilter("losers")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "losers"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Top losers
                </button>
                <button
                  onClick={() => setFilter("volume")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "volume"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Top volume
                </button>
              </div>
            )}

            {/* Crypto Table */}
            {activeTab === "crypto" && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coinbase-blue mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Loading cryptocurrency data...
                    </p>
                  </div>
                ) : !Array.isArray(cryptos) || cryptos.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <p>
                      No cryptocurrency data available. Please make sure the
                      Express server is running.
                    </p>
                    <button
                      onClick={fetchCryptos}
                      className="mt-4 text-coinbase-blue hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Market price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Volume
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Market cap
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Change
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(cryptos) &&
                          cryptos.map((crypto) => (
                            <tr
                              key={crypto.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedCrypto(crypto);
                                router.push(`/price/${crypto.id}`);
                              }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={crypto.image}
                                    alt={crypto.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {crypto.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {crypto.symbol.toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatPrice(crypto.current_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(crypto.total_volume)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(crypto.market_cap)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`flex items-center space-x-1 text-sm font-medium ${
                                    crypto.price_change_percentage_24h >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {crypto.price_change_percentage_24h >= 0 ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                      />
                                    </svg>
                                  )}
                                  <span>
                                    {Math.abs(
                                      crypto.price_change_percentage_24h
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="bg-coinbase-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                    onClick={() =>
                                      router.push(`/price/${crypto.id}`)
                                    }
                                  >
                                    Buy
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
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
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Market Summary */}
            {activeTab === "crypto" && !loading && cryptos.length > 0 && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Crypto market update
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Market cap</div>
                    <div className="text-lg font-semibold text-gray-900">
                      $2.86T <span className="text-red-600">↘ 2.98%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Trade volume
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      $197.13B <span className="text-green-600">↗ 27.42%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      BTC dominance
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      60.24% <span className="text-green-600">↗ 0.29%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Trading Panel */}
          <aside className="lg:col-span-3">
            {selectedCrypto ? (
              <TradingPanel
                key={refreshKey}
                cryptoId={selectedCrypto.id}
                cryptoName={selectedCrypto.name}
                cryptoSymbol={selectedCrypto.symbol}
                currentPrice={selectedCrypto.current_price}
                cryptoImage={selectedCrypto.image}
                onTransactionComplete={() => {
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
                <p className="text-gray-500 text-center">
                  Select a cryptocurrency to trade
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
