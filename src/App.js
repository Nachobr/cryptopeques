import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import Escrow from './artifacts/Escrow.json';

const escrowAddress = '0xF032a51e70FD612c5e8be087D0962735cfAaD717';

function App() {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [escrow, setEscrow] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/market-data');
                setTokens(response.data);
            } catch (error) {
                console.error('Error fetching market data:', error);
            }
        };

        fetchMarketData();

        if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum);
            setProvider(provider);
        }
    }, []);

    const connectWallet = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = provider.getSigner();
            const account = await signer.getAddress();
            setAccount(account);
            const escrowContract = new Contract(escrowAddress, Escrow.abi, signer);
            setEscrow(escrowContract);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };

    const createTransaction = async (seller, amount) => {
        try {
            const tx = await escrow.createTransaction(seller, parseEther(amount));
            await tx.wait();
            setTransactionId(tx.hash);
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    const depositPayment = async () => {
        try {
            const tx = await escrow.depositPayment(transactionId, { value: parseEther('1') });
            await tx.wait();
        } catch (error) {
            console.error('Error depositing payment:', error);
        }
    };

    const confirmDelivery = async () => {
        try {
            const tx = await escrow.confirmDelivery(transactionId);
            await tx.wait();
        } catch (error) {
            console.error('Error confirming delivery:', error);
        }
    };

    return (
        <div>
            <h1>Escrow DApp</h1>
            {account ? (
                <div>
                    <p>Connected as: {account}</p>
                    <button onClick={() => createTransaction('0xSellerAddress', '1')}>Create Transaction</button>
                    <button onClick={depositPayment}>Deposit Payment</button>
                    <button onClick={confirmDelivery}>Confirm Delivery</button>
                </div>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}

            <h1>Market Data</h1>
            <ul>
                {tokens.map(token => (
                    <li key={token.symbol}>
                        {token.name} ({token.symbol}): ${token.price}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
