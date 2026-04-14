const yahooFinance = require('yahoo-finance2').default;

// Explicitly Disable crumb requirement if needed, but usually not
// yahooFinance.setGlobalConfig({ validation: { logErrors: false } });

async function test() {
  try {
    console.log('Testing ^NSEI...');
    const result = await yahooFinance.quote('^NSEI');
    console.log('^NSEI Result:', !!result);
    if (result) console.log('Price:', result.regularMarketPrice);
    
    console.log('Testing BTC-USD...');
    const btc = await yahooFinance.quote('BTC-USD');
    console.log('BTC-USD Result:', !!btc);
    if (btc) console.log('Price:', btc.regularMarketPrice);
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();
