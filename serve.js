const path = require('path');
const express = require('express');
const app = express();
const port = 3034;

app.use(express.static('www'));

app.listen(port, () => 
{
    console.log(`clsSelector.js served on port ${port}`)
});