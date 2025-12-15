// Wallet utility for managing user balance and crypto holdings

export interface Wallet {
  cash: number;
  holdings: { [cryptoId: string]: number }; // cryptoId -> amount owned
}

const WALLET_STORAGE_KEY = 'userWallet';

// Initialize wallet with $1000
export function initializeWallet(): Wallet {
  const defaultWallet: Wallet = {
    cash: 1000,
    holdings: {},
  };
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    }
    // Save initial wallet
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(defaultWallet));
  }
  
  return defaultWallet;
}

// Get current wallet
export function getWallet(): Wallet {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    }
  }
  return initializeWallet();
}

// Save wallet to localStorage
export function saveWallet(wallet: Wallet): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  }
}

// Buy crypto: deduct cash, add crypto
export function buyCrypto(
  cryptoId: string,
  amountUSD: number,
  pricePerUnit: number
): { success: boolean; message: string; wallet?: Wallet } {
  const wallet = getWallet();
  
  if (wallet.cash < amountUSD) {
    return {
      success: false,
      message: `Insufficient funds. You have $${wallet.cash.toFixed(2)} available.`,
    };
  }
  
  if (amountUSD <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than 0.',
    };
  }
  
  const cryptoAmount = amountUSD / pricePerUnit;
  
  const newWallet: Wallet = {
    cash: wallet.cash - amountUSD,
    holdings: {
      ...wallet.holdings,
      [cryptoId]: (wallet.holdings[cryptoId] || 0) + cryptoAmount,
    },
  };
  
  saveWallet(newWallet);
  
  return {
    success: true,
    message: `Successfully bought ${cryptoAmount.toFixed(6)} ${cryptoId.toUpperCase()} for $${amountUSD.toFixed(2)}`,
    wallet: newWallet,
  };
}

// Sell crypto: add cash, deduct crypto
export function sellCrypto(
  cryptoId: string,
  amountUSD: number,
  pricePerUnit: number
): { success: boolean; message: string; wallet?: Wallet } {
  const wallet = getWallet();
  const cryptoAmount = amountUSD / pricePerUnit;
  const currentHolding = wallet.holdings[cryptoId] || 0;
  
  if (currentHolding < cryptoAmount) {
    return {
      success: false,
      message: `Insufficient ${cryptoId.toUpperCase()}. You have ${currentHolding.toFixed(6)} available.`,
    };
  }
  
  if (amountUSD <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than 0.',
    };
  }
  
  const newHoldings = { ...wallet.holdings };
  newHoldings[cryptoId] = currentHolding - cryptoAmount;
  
  // Remove crypto from holdings if amount is 0 or very small
  if (newHoldings[cryptoId] < 0.000001) {
    delete newHoldings[cryptoId];
  }
  
  const newWallet: Wallet = {
    cash: wallet.cash + amountUSD,
    holdings: newHoldings,
  };
  
  saveWallet(newWallet);
  
  return {
    success: true,
    message: `Successfully sold ${cryptoAmount.toFixed(6)} ${cryptoId.toUpperCase()} for $${amountUSD.toFixed(2)}`,
    wallet: newWallet,
  };
}

// Calculate total portfolio value
export function getTotalPortfolioValue(cryptoPrices: { [cryptoId: string]: number }): number {
  const wallet = getWallet();
  let cryptoValue = 0;
  
  Object.entries(wallet.holdings).forEach(([cryptoId, amount]) => {
    const price = cryptoPrices[cryptoId] || 0;
    cryptoValue += amount * price;
  });
  
  return wallet.cash + cryptoValue;
}

// Get crypto holding amount
export function getCryptoHolding(cryptoId: string): number {
  const wallet = getWallet();
  return wallet.holdings[cryptoId] || 0;
}

// Get cash balance
export function getCashBalance(): number {
  const wallet = getWallet();
  return wallet.cash;
}

