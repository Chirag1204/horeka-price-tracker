import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url || !url.includes('horeka.co')) {
      return res.status(400).json({ error: 'Invalid Horeka URL' });
    }

    // Scrape Horeka product page
    const horekaRes = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(horekaRes.data);
    const title = $('h1.product_title').text().trim();
    const priceText = $('.woocommerce-Price-amount').first().text();
    const horekaPrice = parseInt(priceText.replace(/[^\d]/g, ''));

    if (!title || !horekaPrice) {
      return res.status(500).json({ error: 'Could not parse Horeka page' });
    }

    // Flipkart price (via search)
    const flipUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`;
    const flipRes = await axios.get(flipUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $$ = cheerio.load(flipRes.data);
    const flipPriceText = $$('div._30jeq3').first().text();
    const flipkartPrice = flipPriceText ? parseInt(flipPriceText.replace(/[^\d]/g, '')) : null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      title,
      horekaPrice,
      flipkartPrice
    });

  } catch (error) {
    console.error('❌ Serverless function crashed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
