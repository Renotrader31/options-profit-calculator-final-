// Vercel Serverless Function for Stock Price Data
// Supports both Twelve Data and Alpha Vantage APIs

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, provider = 'twelve' } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    let data;
    
    if (provider === 'twelve') {
      data = await fetchTwelveData(symbol);
    } else if (provider === 'alpha') {
      data = await fetchAlphaVantage(symbol);
    } else {
      return res.status(400).json({ error: 'Invalid provider. Use "twelve" or "alpha"' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data', details: error.message });
  }
}

async function fetchTwelveData(symbol) {
  const TWELVE_API_KEY = process.env.TWELVE_DATA_API_KEY;
  
  if (!TWELVE_API_KEY) {
    throw new Error('TWELVE_DATA_API_KEY environment variable not set');
  }

  // Get real-time price
  const priceResponse = await fetch(
    `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_API_KEY}`
  );
  
  if (!priceResponse.ok) {
    throw new Error(`Twelve Data API error: ${priceResponse.statusText}`);
  }
  
  const priceData = await priceResponse.json();
  
  if (priceData.status === 'error') {
    throw new Error(priceData.message || 'Unknown Twelve Data error');
  }

  // Get historical data for volatility calculation
  const histResponse = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_API_KEY}`
  );
  
  const histData = await histResponse.json();
  
  let volatility = null;
  if (histData.values && histData.values.length > 1) {
    volatility = calculateVolatility(histData.values);
  }

  return {
    symbol: symbol.toUpperCase(),
    price: parseFloat(priceData.price),
    volatility: volatility,
    timestamp: new Date().toISOString(),
    provider: 'twelve_data'
  };
}

async function fetchAlphaVantage(symbol) {
  const ALPHA_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!ALPHA_API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY environment variable not set');
  }

  // Get real-time quote
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  
  if (data['Note']) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }

  const quote = data['Global Quote'];
  if (!quote || !quote['05. price']) {
    throw new Error('Invalid response from Alpha Vantage API');
  }

  return {
    symbol: symbol.toUpperCase(),
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: quote['10. change percent'],
    volume: parseInt(quote['06. volume']),
    timestamp: new Date().toISOString(),
    provider: 'alpha_vantage'
  };
}

function calculateVolatility(priceData) {
  if (priceData.length < 2) return null;
  
  const returns = [];
  
  // Calculate daily returns
  for (let i = 1; i < priceData.length; i++) {
    const currentClose = parseFloat(priceData[i].close);
    const previousClose = parseFloat(priceData[i - 1].close);
    const dailyReturn = Math.log(currentClose / previousClose);
    returns.push(dailyReturn);
  }
  
  // Calculate standard deviation
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualized volatility (252 trading days)
  const annualizedVol = stdDev * Math.sqrt(252) * 100;
  
  return Math.round(annualizedVol * 100) / 100; // Round to 2 decimals
}
