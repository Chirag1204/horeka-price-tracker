import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url || !url.includes('horeka.co')) {
      return res.status(400).json({ error: 'Invalid Horeka URL' });
    }

    // Log the URL for debugging
    console.log("Fetching URL:", url);

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 7000
    });

    const $ = cheerio.load(response.data);

    const title = $('h1.product_title').text().trim();
    console.log("Extracted title:", title);

    // Ultra-specific selector for price inside product summary
    const priceText = $('.product .summary .price .woocommerce-Price-amount bdi').first().text();
    console.log("Extracted price text:", priceText);

    const horekaPrice = priceText ? parseInt(priceText.replace(/[^\d]/g, ''), 10) : null;

    if (!title || !horekaPrice) {
      console.error("Could not extract product title or price.");
      return res.status(500).json({ error: 'Could not extract product details' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      title,
      horekaPrice,
      flipkartPrice: null
    });

  } catch (err) {
    console.error("Error occurred:", err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}




