import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const url = req.query.url;
  try {
    const horekaHtml = await axios.get(url);
    const $ = cheerio.load(horekaHtml.data);
    const title = $('h1.product_title').text().trim();
    const priceText = $('.woocommerce-Price-amount').first().text();
    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);

    const flipUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`;
    const flipRes = await axios.get(flipUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $$ = cheerio.load(flipRes.data);
    const flipText = $$('div._30jeq3').first().text();
    const flipPrice = flipText ? parseInt(flipText.replace(/[^\d]/g, ''), 10) : null;

    res.status(200).json({ title, horekaPrice: price, flipkartPrice: flipPrice });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error fetching price' });
  }
}
