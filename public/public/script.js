async function comparePrices() {
  const url = document.getElementById('horekaUrl').value;
  const res = await fetch(`/api/compare?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  document.getElementById('result').innerHTML = `
    <div class="bg-white shadow p-4 rounded">
      <p><strong>Product:</strong> ${data.title}</p>
      <p><strong>Horeka Price:</strong> ₹${data.horekaPrice}</p>
      <p><strong>Flipkart Price:</strong> ₹${data.flipkartPrice ?? 'Not Found'}</p>
      <a href="${url}" target="_blank" class="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Buy from Horeka</a>
    </div>
  `;
}
