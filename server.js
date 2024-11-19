const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

const P2POOL_URL = "http://127.0.0.1:19000";
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch and display data
app.get('/', async (req, res) => {
    try {

        const tip_response = await axios.get(P2POOL_URL + '/stats');

        const tipData = tip_response.data;

        let shaTip = tipData.sha3x_stats.height;
        let rxTip = tipData.randomx_stats.height;

        let page = 10;
        let from_rx = Math.max(rxTip - page, 0);
        let from_sha = Math.max(shaTip - page, 0);

        let data = { sha3x: [], randomX: [] };
        const response = await axios.get(`${P2POOL_URL}/chain?algo=randomx&height=${from_rx}&count=${page}`);
        data.randomX = response.data.reverse();

        const response2 = await axios.get(`${P2POOL_URL}/chain?algo=sha3x&height=${from_sha}&count=${page}`);
        data.sha3x = response2.data.reverse();
        res.render('index', { data });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});


// Route to fetch and display data
app.get('/blocks', async (req, res) => {
    try {

        let algo = req.query.algo;
        let height = Math.max(0, req.query.height || 0);
        let page = req.query.page || 10;

        let data = { page: page, algo: algo, height: height };
        const response = await axios.get(`${P2POOL_URL}/chain?algo=${algo}&height=${height}&count=${page}`);
        data.blocks = response.data.reverse();

        res.render('blocks', { data });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
