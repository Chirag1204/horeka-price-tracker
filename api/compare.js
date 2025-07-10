import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url || !url.includes('horeka.co')) {
      return res.status(400).json({ error: 'Invalid Horeka URL' });
    }

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 7000
    });

    const $ = cheerio.load(response.data);
    const title = $('h1.product_title').text().trim();

    // Look for embedded product JSON
    const jsonLD = $('script[type="application/ld+json"]').html();
    let price = null;

    if (jsonLD) {
      const data = JSON.parse(jsonLD);
      if (data && data.offers && data.offers.price) {
        price = parseInt(data.offers.price, 10);
      }
    }

    if (!title || !price) {
      return res.status(500).json({ error: 'Could not extract product details (via JSON-LD).' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      title,
      horekaPrice: price,
      flipkartPrice: null
    });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}





