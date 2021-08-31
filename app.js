const express = require("express");
const axios = require("axios");
const app = express();

app.get("/jobs", async (req, res) => {
    const searchTerm = req.query.search;
    try {
        const jobs = await axios.get(`https://github.blog/?s=${searchTerm}`);
        res.status(200).send({
            jobs: jobs.data,
        });	
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Node server started");
});

