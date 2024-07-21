import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarketData = () => {
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        const fetchMarketData = async () => {
            const response = await axios.get('http://localhost:3000/api/market-data'); // Update the API endpoint
            setTokens(response.data);
        };

        fetchMarketData();
    }, []);

    return (
        <div>
            <h1>Datos del Mercado</h1>
            <ul>
                {tokens.map(token => (
                    <li key={token.symbol}>
                        {token.name} ({token.symbol}): ${token.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MarketData;
