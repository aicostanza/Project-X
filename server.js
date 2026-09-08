//Server Side JS

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

console.log(process.env.RIOT_API_KEY);

app.get("/riot/account", (req, res) => {
    const gameName = req.query.gameName;
    const tagLine = req.query.tagLine;
    const server = req.query.server;

    let GameName;
    let TagLine;


    const LOLAPIACv1 = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

    console.log(gameName, tagLine);

    fetch(LOLAPIACv1, {
        headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY
        }}) .then(response => {
            console.log(response.status); 
            return response.json()
        })  .then(data => {
            console.log(data);
            const puuid = data.puuid;

            GameName = data.gameName;
            TagLine = data.tagLine;

            const LOLAPIACv4 = `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`

            fetch(LOLAPIACv4, {
                headers: {
                    "X-Riot-Token": process.env.RIOT_API_KEY
                }}) .then(response => {
                    console.log(response.status);
                    return response.json()
                })
                    .then(data => {
                        console.log(data);

                        profileIconId = data.profileIconId;
                        summonerLevel = data.summonerLevel;

                            const LOLAPIACv4RK = `https://${server}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`

                            fetch(LOLAPIACv4RK, {
                                headers: {
                                    "X-Riot-Token": process.env.RIOT_API_KEY
                                }}) .then(response => {
                                    console.log(response.status);

                                    return response.json()
                                }) .then(data => {
                                    console.log(data);

                                        SR = data.find(rank => rank.queueType === "RANKED_SOLO_5x5");
                                        FLEX = data.find(rank => rank.queueType === "RANKED_FLEX_SR");
                                        FIVE = data.find(rank => rank.queueType === "RANKED_PREMADE_5x5");
                                        CLASSIC = data.find(rank => rank.queueType === "JADE_RANKED_SOLO_5x5"); 


                                    })

                                    LOLMATCHv5 = `https://sea.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`
                                    fetch(LOLMATCHv5, {
                                        headers: {
                                            "X-Riot-Token": process.env.RIOT_API_KEY
                                        }
                                    }) .then(response => {
                                        console.log(response.status);
                                        return response.json()
                                    }) .then(data => {
                                        console.log(data);
                                        res.json({

                                        gameName: GameName,
                                        tagLine: TagLine,
                                        profileIconId,
                                        summonerLevel,
                                        SR,
                                        FLEX,
                                        FIVE,
                                        CLASSIC,
                                })
                            })
      
                    }) 
        })      
app.listen(2106, () => {
    console.log("https://localhost:2106");
});