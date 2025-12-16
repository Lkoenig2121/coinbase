"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import TradingPanel from "@/components/TradingPanel";
import Notification from "@/components/Notification";
import { getWallet, getCryptoHolding, initializeWallet } from "@/lib/wallet";

interface CryptoDetail {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  image: string;
  description: string;
}

interface PriceHistory {
  prices: number[][];
  market_caps: number[][];
  total_volumes: number[][];
}

export default function CryptoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [authenticated, setAuthenticated] = useState(false);
  const [crypto, setCrypto] = useState<CryptoDetail | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"balance" | "insights">(
    "insights"
  );
  const [timeRange, setTimeRange] = useState("1");
  const [wallet, setWallet] = useState(getWallet());
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [holdingValue, setHoldingValue] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tradingMode, setTradingMode] = useState<"buy" | "sell" | "convert">(
    "buy"
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) {
      router.push("/");
    } else {
      setAuthenticated(true);
      initializeWallet();
      setWallet(getWallet());
      fetchCryptoDetail();
    }
  }, [router, id]);

  useEffect(() => {
    if (id && authenticated) {
      fetchPriceHistory();
    }
  }, [id, timeRange, authenticated]);

  // Update price and holdings value every second
  useEffect(() => {
    if (id && authenticated && crypto) {
      const updatePrice = async () => {
        try {
          const response = await fetch(
            `http://localhost:3001/api/crypto/${id}`
          );
          if (response.ok) {
            const data = await response.json();
            const newPrice = data.current_price || 0;
            setCurrentPrice(newPrice);

            // Update crypto object with new price
            if (crypto) {
              setCrypto({ ...crypto, current_price: newPrice });
            }

            // Recalculate holding value
            const holding = getCryptoHolding(id);
            setHoldingValue(holding * newPrice);

            // Update wallet state
            setWallet(getWallet());
          }
        } catch (error) {
          console.error("Error fetching updated price:", error);
        }
      };

      // Fetch immediately
      updatePrice();

      // Then update every second
      const interval = setInterval(updatePrice, 1000);

      return () => clearInterval(interval);
    }
  }, [id, authenticated, crypto]);

  const fetchCryptoDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/crypto/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch crypto detail");
      }

      const data = await response.json();

      // Ensure all required fields have default values
      if (data) {
        setCrypto({
          id: data.id || id,
          symbol: data.symbol || "",
          name: data.name || "Unknown",
          current_price: data.current_price ?? 0,
          market_cap: data.market_cap ?? 0,
          total_volume: data.total_volume ?? 0,
          price_change_percentage_24h: data.price_change_percentage_24h ?? 0,
          price_change_24h: data.price_change_24h ?? 0,
          image: data.image || "",
          description: data.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching crypto detail:", error);
      setCrypto(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      setChartLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/crypto/${id}/history?days=${timeRange}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to fetch price history:",
          response.status,
          errorData
        );
        setPriceHistory(null);
        return;
      }

      const data = await response.json();
      console.log("Price history data received:", {
        hasPrices: !!data.prices,
        pricesLength: data.prices?.length,
        dataKeys: Object.keys(data),
      });

      if (data.prices && Array.isArray(data.prices) && data.prices.length > 0) {
        setPriceHistory(data);
      } else {
        console.error("Invalid price history data structure:", data);
        setPriceHistory(null);
      }
    } catch (error) {
      console.error("Error fetching price history:", error);
      setPriceHistory(null);
    } finally {
      setChartLoading(false);
    }
  };

  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "$0.00";
    if (value >= 1) return `$${value.toFixed(2)}`;
    return `$${value.toFixed(4)}`;
  };

  const formatChange = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "+0.00";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
  };

  const renderChart = () => {
    if (
      !priceHistory ||
      !priceHistory.prices ||
      priceHistory.prices.length === 0
    ) {
      return (
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">No chart data available</p>
            <p className="text-xs mt-2 text-gray-400">
              {chartLoading
                ? "Loading..."
                : "Make sure the Express server is running on port 3001"}
            </p>
          </div>
        </div>
      );
    }

    const prices = priceHistory.prices;
    const width = 800;
    const height = 256;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Extract price values
    const priceValues = prices.map(([timestamp, price]) => price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceRange = maxPrice - minPrice || 1;

    // Determine color based on price trend
    const firstPrice = priceValues[0];
    const lastPrice = priceValues[priceValues.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const lineColor = isPositive ? "#10b981" : "#ef4444";

    // Create path for the line
    const pointCoords = prices.map(([timestamp, price], index) => {
      const x = padding + (index / (prices.length - 1)) * chartWidth;
      const y =
        padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      return { x, y };
    });

    const pathData = pointCoords.reduce((path, point, index) => {
      return (
        path +
        (index === 0 ? `M ${point.x},${point.y}` : ` L ${point.x},${point.y}`)
      );
    }, "");

    // Create area path (for gradient fill)
    const lastPoint = pointCoords[pointCoords.length - 1];
    const areaPath = `${pathData} L ${lastPoint.x},${
      height - padding
    } L ${padding},${height - padding} Z`;

    return (
      <div className="h-64 bg-gray-50 rounded-lg p-4">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`chartGradient-${id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * chartHeight}
              x2={width - padding}
              y2={padding + ratio * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#chartGradient-${id})`} />

          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current price indicator */}
          {lastPoint && (
            <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill={lineColor} />
          )}
        </svg>
      </div>
    );
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coinbase-blue"></div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Cryptocurrency not found</p>
          <Link href="/trade" className="text-coinbase-blue hover:underline">
            Back to Trade
          </Link>
        </div>
      </div>
    );
  }

  // Use current price if available, otherwise use crypto price
  const displayPrice = currentPrice || crypto?.current_price || 0;

  // Calculate price change - use API 24h change data
  const priceChange = crypto?.price_change_24h ?? 0;
  const priceChangePercent = crypto?.price_change_percentage_24h ?? 0;
  const isPositive = priceChangePercent >= 0;

  return (
    <div className="min-h-screen bg-white">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
                  className="px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-coinbase-blue font-medium transition-colors"
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
          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Crypto Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={crypto?.image || ""}
                  alt={crypto?.name || ""}
                  className="w-12 h-12 rounded-full"
                />
                <h1 className="text-3xl font-bold text-gray-900">
                  {crypto?.name || "Loading..."}
                </h1>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-baseline space-x-4 mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(currentPrice || crypto?.current_price || 0)}
                </div>
                <div
                  className={`flex items-center space-x-2 text-lg font-semibold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? (
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
                        d="M7 17l9.2-9.2M17 17V7m0 10H7"
                      />
                    </svg>
                  ) : (
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
                        d="M17 7l-9.2 9.2M7 7v10m0-10h10"
                      />
                    </svg>
                  )}
                  <span>
                    {formatChange(priceChange)} (
                    {formatChange(priceChangePercent)}%) 24h
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-4">
                {chartLoading ? (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coinbase-blue mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading chart...</p>
                    </div>
                  </div>
                ) : (
                  renderChart()
                )}
              </div>

              {/* Time Range Selectors */}
              <div className="flex space-x-2">
                {[
                  { value: "1", label: "1H" },
                  { value: "7", label: "1D" },
                  { value: "30", label: "1W" },
                  { value: "90", label: "1M" },
                  { value: "365", label: "1Y" },
                  { value: "365", label: "ALL" },
                ].map((range, index) => {
                  const isMax = index === 5;
                  const isSelected = isMax
                    ? timeRange === "365"
                    : timeRange === range.value;
                  return (
                    <button
                      key={index}
                      onClick={() => setTimeRange(range.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isSelected
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("balance")}
                  className={`pb-4 px-2 font-medium ${
                    activeTab === "balance"
                      ? "text-coinbase-blue border-b-2 border-coinbase-blue"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Balance
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`pb-4 px-2 font-medium ${
                    activeTab === "insights"
                      ? "text-coinbase-blue border-b-2 border-coinbase-blue"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Insights
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "balance" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Balance
                </h3>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                    <span>${holdingValue.toFixed(2)}</span>
                    <span className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                      Live
                    </span>
                  </div>
                  <div className="text-gray-600 mb-4">
                    {getCryptoHolding(crypto?.id || "").toFixed(6)}{" "}
                    {crypto?.symbol?.toUpperCase() || ""}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p>
                      Current price: $
                      {(currentPrice || crypto?.current_price || 0).toFixed(2)}
                    </p>
                    <p>All-time returns: $0.00 (0.00%)</p>
                  </div>
                  {getCryptoHolding(crypto?.id || "") > 0 && (
                    <button
                      onClick={() => {
                        setTradingMode("sell");
                        // Scroll to trading panel
                        setTimeout(() => {
                          const tradingPanel = document.querySelector(
                            "[data-trading-panel]"
                          );
                          tradingPanel?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }, 100);
                      }}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Sell {crypto?.symbol?.toUpperCase() || ""}
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-2 h-2 bg-coinbase-blue rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">
                          Happening now
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          AI generated 1h ago
                        </span>
                      </div>
                      <p className="text-gray-900">
                        After declining roughly{" "}
                        {Math.abs(priceChangePercent).toFixed(0)}% over the past
                        week, {crypto?.symbol?.toUpperCase() || "crypto"}{" "}
                        traders are watching whether a significant surge in
                        trading activity can help stabilize the{" "}
                        {isPositive ? "rising" : "falling"} price.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {isPositive ? "Heavy buying" : "Heavy selling"} meets
                    increased activity
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {crypto?.name || "This cryptocurrency"} has{" "}
                    {isPositive ? "risen" : "dropped"} roughly{" "}
                    {Math.abs(priceChangePercent).toFixed(0)}% over the past
                    week even as trading volume{" "}
                    {isPositive ? "increased" : "jumped"} approximately{" "}
                    {Math.floor(Math.random() * 50 + 50)}% in the past 24 hours
                    and unique traders increased by around{" "}
                    {Math.floor(Math.random() * 50 + 50)}%, showing more people
                    are getting involved {isPositive ? "with" : "despite"} the
                    price.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Trading Panel */}
          <aside className="lg:col-span-3">
            {crypto && (
              <div data-trading-panel>
                <TradingPanel
                  key={`${refreshKey}-${tradingMode}`}
                  cryptoId={crypto.id}
                  cryptoName={crypto.name}
                  cryptoSymbol={crypto.symbol}
                  currentPrice={crypto.current_price}
                  cryptoImage={crypto.image}
                  initialMode={tradingMode}
                  onTransactionComplete={() => {
                    setWallet(getWallet());
                    setRefreshKey((prev) => prev + 1);
                    setTradingMode("buy"); // Reset to buy mode after transaction
                  }}
                  onShowNotification={(message, type) => {
                    setNotification({ message, type });
                  }}
                />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
