"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) {
      router.push("/");
    } else {
      setAuthenticated(true);
      fetchCryptoDetail();
    }
  }, [router, id]);

  useEffect(() => {
    if (id && authenticated) {
      fetchPriceHistory();
    }
  }, [id, timeRange, authenticated]);

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

  const priceChange = crypto?.price_change_24h ?? 0;
  const priceChangePercent = crypto?.price_change_percentage_24h ?? 0;
  const isPositive = (priceChangePercent ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
                  {formatPrice(crypto?.current_price)}
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
                    {formatChange(priceChangePercent)}%)
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
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    $0.00
                  </div>
                  <div className="text-gray-600 mb-4">
                    0 {crypto?.symbol?.toUpperCase() || ""}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Today's returns: $0.00 (0.00%)</p>
                    <p>All-time returns: $0.00 (0.00%)</p>
                  </div>
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
              <div className="flex space-x-1 mb-6">
                <button className="flex-1 py-2 px-3 bg-gray-900 text-white rounded-lg text-sm font-medium">
                  Buy
                </button>
                <button className="flex-1 py-2 px-3 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Sell
                </button>
                <button className="flex-1 py-2 px-3 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Convert
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-600 mb-1">One-time order</div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">One-time order</span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  0 USD
                </div>
                <div className="flex items-center justify-end mb-2">
                  <button className="text-xs text-coinbase-blue hover:underline">
                    Max
                  </button>
                </div>
                <div className="text-sm text-coinbase-blue">
                  0 {crypto?.symbol?.toUpperCase() || ""}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-sm text-gray-600 mb-1">Pay with</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Select a payment method
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-sm text-gray-600 mb-1">Buy</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={crypto?.image || ""}
                        alt={crypto?.name || ""}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {crypto?.name || ""}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button className="w-full bg-coinbase-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-6">
                Continue to payment
              </button>

              <div className="space-y-3">
                <button className="w-full flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
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
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  <span className="text-sm font-medium">Send crypto</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className="text-sm font-medium">Receive crypto</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
