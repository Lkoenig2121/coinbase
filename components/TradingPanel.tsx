"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getWallet,
  buyCrypto,
  sellCrypto,
  getCryptoHolding,
  getCashBalance,
} from "@/lib/wallet";

interface TradingPanelProps {
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice: number;
  cryptoImage?: string;
  onTransactionComplete?: () => void;
}

export default function TradingPanel({
  cryptoId,
  cryptoName,
  cryptoSymbol,
  currentPrice,
  cryptoImage,
  onTransactionComplete,
}: TradingPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"buy" | "sell" | "convert">("buy");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(getWallet());
  const [livePrice, setLivePrice] = useState(currentPrice);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const currentWallet = getWallet();
    setWallet(currentWallet);
    setLivePrice(currentPrice);
  }, [currentPrice]);

  // Update price every second
  useEffect(() => {
    const updatePrice = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/crypto/${cryptoId}`
        );
        if (response.ok) {
          const data = await response.json();
          setLivePrice(data.current_price || currentPrice);
        }
      } catch (error) {
        console.error("Error fetching updated price:", error);
      }
    };

    const interval = setInterval(updatePrice, 1000);
    return () => clearInterval(interval);
  }, [cryptoId, currentPrice]);

  const holding = getCryptoHolding(cryptoId);
  const cashBalance = getCashBalance();
  const maxBuyAmount = cashBalance;
  const maxSellAmount = holding * livePrice;

  // Use live price for calculations
  const effectivePrice = livePrice || currentPrice;

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      setAmount(value);
      setMessage(null);
    }
  };

  const handleMax = () => {
    if (mode === "buy") {
      setAmount(maxBuyAmount.toFixed(2));
    } else {
      setAmount(maxSellAmount.toFixed(2));
    }
  };

  const handleTransaction = () => {
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid amount",
      });
      return;
    }

    let result;
    if (mode === "buy") {
      result = buyCrypto(cryptoId, amountNum, effectivePrice);
    } else {
      result = sellCrypto(cryptoId, amountNum, effectivePrice);
    }

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message,
      });
      setAmount("");
      const updatedWallet = getWallet();
      setWallet(updatedWallet);
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({
        type: "error",
        text: result.message,
      });
    }
  };

  const cryptoAmount =
    amount && effectivePrice > 0
      ? (parseFloat(amount) / effectivePrice).toFixed(6)
      : "0";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => {
            setMode("buy");
            setAmount("");
            setMessage(null);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "buy"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => {
            setMode("sell");
            setAmount("");
            setMessage(null);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "sell"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Sell
        </button>
        <button
          onClick={() => {
            setMode("convert");
            setAmount("");
            setMessage(null);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === "convert"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Convert
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

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
        <div className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
          />
          <span className="text-3xl font-bold text-gray-400">USD</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-coinbase-blue">
            {mode === "buy" ? "↓" : "↑"} {cryptoAmount}{" "}
            {cryptoSymbol.toUpperCase()}
          </div>
          <button
            onClick={handleMax}
            className="text-xs text-coinbase-blue hover:underline"
          >
            Max
          </button>
        </div>
        {mode === "buy" && (
          <div className="text-xs text-gray-500 mt-1">
            Available: ${cashBalance.toFixed(2)}
          </div>
        )}
        {mode === "sell" && (
          <div className="text-xs text-gray-500 mt-1">
            Available: {holding.toFixed(6)} {cryptoSymbol.toUpperCase()} ($
            {maxSellAmount.toFixed(2)})
          </div>
        )}
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
                {mode === "buy" ? "Cash" : "Crypto"}
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
          <div className="text-sm text-gray-600 mb-1">
            {mode === "buy" ? "Buy" : "Sell"}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {cryptoImage ? (
                <img
                  src={cryptoImage}
                  alt={cryptoName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {cryptoSymbol[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">{cryptoName}</span>
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

      <button
        onClick={handleTransaction}
        disabled={!amount || parseFloat(amount) <= 0}
        className="w-full bg-coinbase-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {mode === "buy" ? "Buy" : mode === "sell" ? "Sell" : "Convert"}{" "}
        {cryptoName}
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
  );
}
