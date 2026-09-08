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

    let LOLToken = process.env.RIOT_API_KEY;
    let LOLAPISMNv4;
    let LOLAPILGv4;
    let LOLMATCHv5;

    const LOLAPIACv1 = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`; // Account Info + PUUID

    console.log(gameName, tagLine, server);

    //
    // ACCOUNT V1 / GET ACCOUNT BY GAMENAME + TAG LINE API CALL
    //
    // URL: https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
    //

    fetch(LOLAPIACv1, {
        headers: {
            "X-Riot-Token": LOLToken
        }}) .then(response => {
            console.log(response.status);
            return response.json()
        }) .then(data => {
            console.log(data);

            const puuid = data.puuid;
            LOLAPISMNv4 = `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`; // Summoner Info + Profile Icon + Level
            LOLAPILGv4 = `https://${server}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`; // LOL RANKED INFO
            LOLMATCHv5 = `https://${server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`; // LOL MATCH HISTORY
        }) 
        
    //
    // RETURNED DATA: PUUID
    //
        
    // 
    // LEAGUE SUMMONERV4 / GET SUMMONER ICON + LEVEL API CALL
    // 
    // URL: https://${server}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}
    //

    .then(() => {
        return fetch(LOLAPISMNv4, {
        headers: {
            "X-Riot-Token": LOLToken
        }}) .then(response => {
                console.log(response.status);
                return response.json();
        }) .then(data => {
                console.log(data);

                profileIconId = data.profileIconId;
                summonerLevel = data.summonerLevel;
            }) 
    //
    // RETURNED DATA: Profile Icon + Summoner Level
    //

    //
    // LEAGUE V4 / GET RANKED INFO API CALL 
    //
    // URL: https://${server}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}
    //

    .then(() => {
    return fetch(LOLAPILGv4, {
        headers: {
        "X-Riot-Token": LOLToken
        }}) .then(response => {
            console.log(response.status);
            return response.json();
        })  .then(data => {
            console.log(data);

            SR = data.find(entry => entry.queueType === "RANKED_SOLO_5x5");
            FLEX = data.find(entry => entry.queueType === "RANKED_FLEX_SR");
            FIVE = data.find(entry => entry.queueType === "RANKED_PREMADE_5x5");
            CLASSIC = data.find(entry => entry.queueType === "JADE_RANKED_SOLO_5x5");
            }) 
    // 
    // RETURNED DATA: Ranked Info
    //
    
    //
    // MATCH V5 / GET MATCH ID API CALL
    //
    // URL: https://${server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20
    //
    
    .then(() => {
        return fetch(LOLMATCHv5, { 
        headers: {
            "X-Riot-Token": LOLToken
            }}) .then(response => {
                console.log(response.status);
                return response.json();
            })  .then(data => {
                console.log(data);
                
                res.json({
                    gameName: gameName,
                    tagLine: tagLine,
                    server: server,
                    profileIconId: profileIconId,
                    summonerLevel: summonerLevel,
                    SR: SR,
                    FLEX: FLEX,
                    FIVE: FIVE,
                    CLASSIC: CLASSIC,
                    matchHistory: data
                    });
                })
            })
        }) 
    });
});

app.listen(2106, () => {
    console.log("Server running on http://localhost:2106");
});