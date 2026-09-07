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
                                        const soloRank = data.find(rank => rank.queueType === "RANKED_SOLO_5x5");
                                        let SDQueue = soloRank.queueType;
                                        let SDTier = soloRank.tier;
                                        let SDRank = soloRank.rank;
                                        let SDLP = soloRank.leaguePoints;
                                        let SDW = soloRank.wins;
                                        let SDL = soloRank.losses;

                                        const classicRank = data.find(rank => rank.queueType === "JADE_RANKED_SOLO_5x5");
                                        let CLASSICQueue = classicRank.queueType;
                                        let CLASSICTier = classicRank.tier;
                                        let CLASSICRank = classicRank.rank;
                                        let CLASSICLP = classicRank.leaguePoints;
                                        let CLASSICW = classicRank.wins;
                                        let CLASSICL = classicRank.losses;

                                    res.json({
                                        gameName: GameName,
                                        tagLine: TagLine,
                                        profileIconId: profileIconId,
                                        summonerLevel: summonerLevel,

                                        queueType: SDQueue, classicQueue: CLASSICQueue,
                                        tier: SDTier, classicTier: CLASSICTier,
                                        rank: SDRank, classicRank: CLASSICRank,
                                        leaguePoints: SDLP, classicLeaguePoints: CLASSICLP,
                                        wins: SDW, classicWins: CLASSICW,
                                        losses: SDL, classicLosses: CLASSICL
                                    })
                                })
                            })
      
                    }) 
        })      
app.listen(2106, () => {
    console.log("https://localhost:2106");
});