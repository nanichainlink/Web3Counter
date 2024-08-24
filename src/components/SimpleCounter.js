import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SimpleCounterABI from './SimpleCounterABI.json';
import { Container, Button, Typography, Paper, Snackbar, CircularProgress, Grid } from '@mui/material';
import { Add, Remove, Replay, Sync } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SimpleCounter = () => {
    const [counter, setCounter] = useState(0);
    const [account, setAccount] = useState('');
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const contractAddress = '0xF650EDcA5D3Cb7649AF37bd49b87B79253f96e76';

    useEffect(() => {
        loadBlockchainData();
    }, []);

    const loadBlockchainData = async () => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);

            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const contractInstance = new web3Instance.eth.Contract(SimpleCounterABI, contractAddress);
                setContract(contractInstance);

                const counterValue = await contractInstance.methods.getCounter().call();
                setCounter(Number(counterValue));
            } catch (error) {
                console.error("Error accessing accounts or methods", error);
            }
        } else {
            console.error("Non-Ethereum browser detected. Consider trying MetaMask!");
        }
    };

    const handleTransaction = async (transactionMethod) => {
        setLoading(true); // Inicia el estado de carga
        try {
            setSnackbarOpen(true);
            setSnackbarMessage('Transaction in progress...');
            await transactionMethod();
            
            // Esperar a la confirmación de la transacción
            const counterValue = await contract.methods.getCounter().call();
            setCounter(Number(counterValue));
            setSnackbarMessage('Transaction confirmed!');
        } catch (error) {
            setSnackbarMessage('Transaction failed!');
            console.error("Transaction error", error);
        } finally {
            setLoading(false); // Detiene el estado de carga después de la transacción
        }
    };
    

    const incrementCounter = () => handleTransaction(() => contract.methods.increment().send({ from: account }));
    const decrementCounter = () => handleTransaction(() => contract.methods.decrement().send({ from: account }));
    const resetCounter = () => handleTransaction(() => contract.methods.reset().send({ from: account }));
    const getCounter = async () => {
        try {
            const counterValue = await contract.methods.getCounter().call();
            setCounter(Number(counterValue));
        } catch (error) {
            console.error("Error fetching counter", error);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} style={{ padding: 20, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Simple Counter
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Account: {account}
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Counter: {loading ? <CircularProgress size={24} /> : counter}
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={incrementCounter} startIcon={<Add />}>
                            Increment
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="secondary" onClick={decrementCounter} startIcon={<Remove />}>
                            Decrement
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" onClick={resetCounter} startIcon={<Replay />}>
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" onClick={getCounter} startIcon={<Sync />}>
                            Get Counter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="info">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SimpleCounter;
