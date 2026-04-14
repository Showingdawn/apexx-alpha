import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    console.log('Testing ^NSEI...');
    const quote: any = await yahooFinance.quote('^NSEI');
    console.log('^NSEI Quote Success:', quote.regularMarketPrice);
    
    console.log('Testing BTC-USD...');
    const btc: any = await yahooFinance.quote('BTC-USD');
    console.log('BTC-USD Quote Success:', btc.regularMarketPrice);
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();
