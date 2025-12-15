"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) {
      router.push("/");
    } else {
      setAuthenticated(true);
    }
  }, [router]);

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
                  <h2 className="text-4xl font-bold text-gray-900">$0.00</h2>
                  <p className="text-gray-600 mt-1">$0.00 (0.00%) 1D</p>
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
                  <p className="text-lg font-semibold">$0.00</p>
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
                  <p className="text-lg font-semibold">$0.00</p>
                </div>
              </div>
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

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  0 USD
                </div>
                <div className="text-sm text-coinbase-blue">0 BTC</div>
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
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span className="text-sm font-medium">Bitcoin</span>
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-sm font-medium">Deposit cash</span>
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Withdraw cash</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
