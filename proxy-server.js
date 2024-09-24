const express = require('express');
const yahooFinance = require('yahoo-finance2').default; // Import yahoo-finance2
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

app.get('/:stockCode', async (req, res) => {
  try {
    const baseStockCode = req.params.stockCode; // Get the stock code from the URL parameter
    const stockCode = `${baseStockCode}.NS`; // Append 'NS' to the stock code for Indian market

    // Fetch stock data from Yahoo Finance API
    const stockData = await yahooFinance.quote(stockCode);

    if (!stockData || !stockData.regularMarketPrice) {
      throw new Error('Stock data not found');
    }

    // Send JSON response with stock price
    res.json({
      stockCode: baseStockCode,
      price: stockData.regularMarketPrice
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
