const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// CoinGecko API endpoint
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Simple in-memory cache to reduce API calls
const cache = {
  markets: { data: null, timestamp: null },
  coins: {}, // { id: { data: null, timestamp: null } }
  history: {}, // { "id-days": { data: null, timestamp: null } }
};

const CACHE_DURATION = 60000; // 60 seconds cache

function getCached(key, cacheObj) {
  const cached = cacheObj[key];
  if (cached && cached.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCached(key, data, cacheObj) {
  cacheObj[key] = { data, timestamp: Date.now() };
}

// Get cryptocurrency data
app.get("/api/crypto", async (req, res) => {
  try {
    // Check cache first
    const cached = getCached("markets", cache);
    if (cached) {
      console.log("Returning cached markets data");
      return res.json(cached);
    }

    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
      },
    });

    const cryptos = response.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      image: coin.image,
    }));

    // Cache the result
    setCached("markets", cryptos, cache);

    res.json(cryptos);
  } catch (error) {
    console.error("Error fetching crypto data:", error.message);
    
    // Check if it's a rate limit error
    if (error.response && error.response.status === 429) {
      // Try to return cached data even if expired
      const cached = cache.markets.data;
      if (cached) {
        console.log("Rate limited - returning stale cached data");
        return res.json(cached);
      }
      return res.status(429).json({ 
        error: "API rate limit exceeded. Please wait a moment and try again.",
        retryAfter: 60 
      });
    }
    
    res.status(500).json({ error: "Failed to fetch cryptocurrency data" });
  }
});

// Get specific cryptocurrency by ID with detailed data
app.get("/api/crypto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cached = getCached(id, cache.coins);
    if (cached) {
      console.log(`Returning cached data for ${id}`);
      return res.json(cached);
    }

    const response = await axios.get(`${COINGECKO_API}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });

    const coin = response.data;
    const coinData = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.market_data.current_price.usd,
      market_cap: coin.market_data.market_cap.usd,
      total_volume: coin.market_data.total_volume.usd,
      price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
      price_change_24h: coin.market_data.price_change_24h,
      image: coin.image.small,
      description: coin.description?.en || "",
      links: coin.links,
    };

    // Cache the result
    setCached(id, coinData, cache.coins);

    res.json(coinData);
  } catch (error) {
    console.error("Error fetching crypto data:", error.message);
    
    // Check if it's a rate limit error
    if (error.response && error.response.status === 429) {
      const cached = cache.coins[req.params.id]?.data;
      if (cached) {
        console.log("Rate limited - returning stale cached data");
        return res.json(cached);
      }
      return res.status(429).json({ 
        error: "API rate limit exceeded. Please wait a moment and try again.",
        retryAfter: 60 
      });
    }
    
    res.status(500).json({ error: "Failed to fetch cryptocurrency data" });
  }
});

// Get price history for charts
app.get("/api/crypto/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const { days = "1" } = req.query;
    const cacheKey = `${id}-${days}`;

    // Check cache first
    const cached = getCached(cacheKey, cache.history);
    if (cached) {
      console.log(`Returning cached history for ${cacheKey}`);
      return res.json(cached);
    }

    // CoinGecko API: interval can only be used with days >= 7
    const params = {
      vs_currency: "usd",
      days: days,
    };

    // Only add interval for days >= 7
    if (parseInt(days) >= 7) {
      params.interval = "daily";
    }

    const response = await axios.get(
      `${COINGECKO_API}/coins/${id}/market_chart`,
      { params }
    );

    // Validate response data
    if (!response.data || !response.data.prices) {
      console.error("Invalid response from CoinGecko:", response.data);
      return res.status(500).json({ error: "Invalid data from CoinGecko API" });
    }

    const historyData = {
      prices: response.data.prices || [],
      market_caps: response.data.market_caps || [],
      total_volumes: response.data.total_volumes || [],
    };

    // Cache the result
    setCached(cacheKey, historyData, cache.history);

    console.log(`Fetched price history for ${id}:`, {
      pricesCount: historyData.prices.length,
      days: days
    });

    res.json(historyData);
  } catch (error) {
    console.error("Error fetching price history:", error.message);
    
    // Check if it's a rate limit error
    if (error.response && error.response.status === 429) {
      const cacheKey = `${req.params.id}-${req.query.days || "1"}`;
      const cached = cache.history[cacheKey]?.data;
      if (cached) {
        console.log("Rate limited - returning stale cached data");
        return res.json(cached);
      }
      return res.status(429).json({ 
        error: "API rate limit exceeded. Please wait a moment and try again.",
        retryAfter: 60 
      });
    }
    
    if (error.response) {
      console.error("CoinGecko API response:", error.response.status, error.response.data);
    }
    res.status(500).json({ error: "Failed to fetch price history", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
