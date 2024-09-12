const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

app.get('/:stockCode', async (req, res) => {
  try {
    const baseStockCode = req.params.stockCode; // Get the stock code from the URL parameter
    const stockCode = `${baseStockCode}.NS`; // Append 'NS' to the stock code for the URL and selector
    const url = `https://finance.yahoo.com/quote/${stockCode}/`;

    const browser = await puppeteer.launch({ headless: true }); // Set to false if you want to see the browser
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the specific element to load
    await page.waitForSelector(`fin-streamer[data-field="regularMarketPrice"][data-symbol="${stockCode}"]`, { timeout: 150000 });

    // Extract stock price using Puppeteer
    const price = await page.evaluate((stockCode) => {
      const element = document.querySelector(`fin-streamer[data-field="regularMarketPrice"][data-symbol="${stockCode}"]`);
      if (element) {
        // Extracting the exact value from the 'data-value' attribute
        const dataValue = element.getAttribute('data-value');
        // Alternatively, extract from the span inside if needed
        const spanValue = element.querySelector('span')?.textContent;
        return dataValue || spanValue || 'Price not found';
      }
      return 'Price not found';
    }, stockCode);

    await browser.close();

    // Send JSON response
    res.json({
      stockCode: baseStockCode, // Send the base stock code
      price: price
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});