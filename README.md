# Coinbase Clone

A modern cryptocurrency trading platform clone built with Next.js, TypeScript, Tailwind CSS, and Express.

## Features

- **Login Page**: Secure login with demo credentials displayed
- **Home Dashboard**: Responsive 3-column layout with balance, promotional cards, and trading panel
- **Trading Screen**: Real-time cryptocurrency prices fetched from CoinGecko API
- **Cryptocurrency Detail Page**: Detailed view for each cryptocurrency with price charts, insights, and trading panel
- **Responsive Design**: Fully responsive across all device sizes

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **API**: CoinGecko API for cryptocurrency data

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start both servers concurrently:
```bash
npm run dev
```

This will start:
- Express server on [http://localhost:3001](http://localhost:3001)
- Next.js development server on [http://localhost:3000](http://localhost:3000)

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Alternative: Run servers separately

If you prefer to run the servers in separate terminals:

**Terminal 1 - Express server:**
```bash
npm run server
```

**Terminal 2 - Next.js client:**
```bash
npm run client
```

## Demo Credentials

- **Email**: demo@coinbase.com
- **Password**: demo123456

## Project Structure

```
coinbase/
├── app/
│   ├── page.tsx          # Login page
│   ├── home/
│   │   └── page.tsx      # Home dashboard
│   ├── trade/
│   │   └── page.tsx      # Trading screen
│   ├── price/
│   │   └── [id]/
│   │       └── page.tsx  # Cryptocurrency detail page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── server/
│   └── index.js          # Express server
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## API Endpoints

- `GET /api/crypto` - Get list of cryptocurrencies with market data
- `GET /api/crypto/:id` - Get specific cryptocurrency details
- `GET /api/crypto/:id/history?days=1` - Get price history for charts (days: 1, 7, 30, 90, 365)

## Notes

- The Express server runs on port 3001
- The Next.js app runs on port 3000
- Make sure both servers are running for the trading screen to work properly

