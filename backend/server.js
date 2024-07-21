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
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': 'bf0ef560-01b9-4b16-8445-f17a0d0c2e07'  // Replace with your CoinMarketCap API key
            },
            params: {
                start: 1,
                limit: 10,
                convert: 'USD'
            }
        });

        // Parse the response data to extract token details
        const tokens = response.data.data.map(coin => ({
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price
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
