// Vercel Serverless Function for Options Chain Data

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

  const { symbol, expiration, provider = 'twelve' } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    let data;
    
    if (provider === 'twelve') {
      data = await fetchTwelveDataOptions(symbol, expiration);
    } else {
      return res.status(400).json({ error: 'Only Twelve Data provider supported for options' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Options API Error:', error);
    res.status(500).json({ error: 'Failed to fetch options data', details: error.message });
  }
}

async function fetchTwelveDataOptions(symbol, expiration) {
  const TWELVE_API_KEY = process.env.TWELVE_DATA_API_KEY;
  
  if (!TWELVE_API_KEY) {
    throw new Error('TWELVE_DATA_API_KEY environment variable not set');
  }

  // Get options chain
  let url = `https://api.twelvedata.com/options_chain?symbol=${symbol}&apikey=${TWELVE_API_KEY}`;
  
  if (expiration) {
    url += `&expiration_date=${expiration}`;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Twelve Data Options API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Unknown Twelve Data error');
  }

  // Transform the data into a more usable format
  const transformedData = {
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString(),
    expirations: [],
    calls: [],
    puts: []
  };

  if (data.calls) {
    transformedData.calls = data.calls.map(call => ({
      strike: parseFloat(call.strike),
      premium: parseFloat(call.last_price || call.bid || 0),
      bid: parseFloat(call.bid || 0),
      ask: parseFloat(call.ask || 0),
      volume: parseInt(call.volume || 0),
      openInterest: parseInt(call.open_interest || 0),
      impliedVolatility: parseFloat(call.implied_volatility || 0),
      delta: parseFloat(call.delta || 0),
      gamma: parseFloat(call.gamma || 0),
      theta: parseFloat(call.theta || 0),
      vega: parseFloat(call.vega || 0),
      expiration: call.expiration_date
    }));
  }

  if (data.puts) {
    transformedData.puts = data.puts.map(put => ({
      strike: parseFloat(put.strike),
      premium: parseFloat(put.last_price || put.bid || 0),
      bid: parseFloat(put.bid || 0),
      ask: parseFloat(put.ask || 0),
      volume: parseInt(put.volume || 0),
      openInterest: parseInt(put.open_interest || 0),
      impliedVolatility: parseFloat(put.implied_volatility || 0),
      delta: parseFloat(put.delta || 0),
      gamma: parseFloat(put.gamma || 0),
      theta: parseFloat(put.theta || 0),
      vega: parseFloat(put.vega || 0),
      expiration: put.expiration_date
    }));
  }

  return transformedData;
}
