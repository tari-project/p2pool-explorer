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
        // Take an extra 5 so that we can find the previous block for hashrate calc
        let from_rx = Math.max(rxTip - page - 5, 0);
        let from_sha = Math.max(shaTip - page - 5, 0);

        let data = { sha3x: [], randomX: [] };
        let actual_page = page + 5
        const response = await axios.get(`${P2POOL_URL}/chain?algo=randomx&height=${from_rx}&count=${actual_page}`);
        calcHashrates(response.data);
        data.randomX = response.data.reverse().slice(0, page);

        const response2 = await axios.get(`${P2POOL_URL}/chain?algo=sha3x&height=${from_sha}&count=${actual_page}`);
        calcHashrates(response2.data);
        data.sha3x = response2.data.reverse().slice(0, page);
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
        let actualPage = page * 1 + 5;

        let data = { page: page, algo: algo, height: height };
        let from = Math.max(height - 5, 0);

        const response = await axios.get(`${P2POOL_URL}/chain?algo=${algo}&height=${from}&count=${actualPage}`);
        calcHashrates(response.data);
        data.blocks = response.data.reverse().slice(0, page);

        res.render('blocks', { data });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});


function calcHashrates(data) {
    let blocks = {};
    for (let i = 0; i < data.length; i++) {
        blocks[data[i].hash] = data[i];
    }

    for (let i = 1; i < data.length; i++) {
        let block = data[i];
        let prev_block = blocks[block.prev_hash];
        if (!prev_block) {
            console.error("Missing previous block", block.prev_hash);
            continue
        }
        // let diff = block.target_difficulty - prev_block.target_difficulty;
        // let time = block.timestamp - prev_block.timestamp;
        let hashrate = block.target_difficulty / 10;
        block.hashrate = hashrate;
    }
}


// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
