const express = require("express");
const axios = require("axios");
const redis = require("redis");
const bluebird = require("bluebird");

const app = express();


const REDIS_HOST = process.env.REDIS_URL || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_URI = `redis://${REDIS_HOST}:${REDIS_PORT}`;

const redisCacheClient = redis.createClient(REDIS_URI);

//log error to the console if any occurs
redisCacheClient.on("error", (err) => {
    console.log(err);
});

bluebird.promisifyAll(redis);


app.get("/jobs", async(req, res) => {
    const searchTerm = req.query.search;
    try {
        const jobs = await redisCacheClient.getAsync(searchTerm);
            if (jobs) {
                res.status(200).send({
                    jobs: JSON.parse(jobs),
                    message: "data retrieved from the cache"
                });
            } else {
                const jobs = await axios.get(`https://github.blog/?s=${searchTerm}`);
                /* const dataToCached = JSON.stringify(jobs.data); */
                await redisCacheClient.setAsync(searchTerm, jobs.data);
            }
        
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});



app.listen(process.env.PORT || 3000, () => {
    console.log("Node server With Redis started");
});


