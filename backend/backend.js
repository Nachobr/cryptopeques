const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();

// Configuración de la base de datos
mongoose.connect('mongodb://localhost:27017/cryptoSim', { useNewUrlParser: true, useUnifiedTopology: true });

// Esquema y modelo de la base de datos
const tokenSchema = new mongoose.Schema({
  name: String,
  symbol: String,
  price: Number,
  updatedAt: { type: Date, default: Date.now }
});

const Token = mongoose.model('Token', tokenSchema);

// Ruta para obtener datos del mercado
app.get('/api/market-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false
      }
    });

    const tokens = response.data.map(coin => ({
      name: coin.name,
      symbol: coin.symbol,
      price: coin.current_price
    }));

    // Guarda los datos en la base de datos
    await Token.deleteMany({});
    await Token.insertMany(tokens);

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo datos del mercado' });
  }
});

// Servidor en funcionamiento
app.listen(3000, () => {
  console.log('Servidor ejecutándose en el puerto 3000');
});
