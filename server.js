// Riot Data Dragon public catalog API. No API key required.
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
const CDN = "https://ddragon.leagueoflegends.com";
let catalogCache = null;
let cacheUntil = 0;
async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Upstream API returned ${response.status}`);
  return response.json();
}
async function getCatalog() {
  if (catalogCache && Date.now() < cacheUntil) return catalogCache;
  const versions = await json(`${CDN}/api/versions.json`);
  const version = versions[0];
  const roster = await json(`${CDN}/cdn/${version}/data/en_US/champion.json`);
  const champions = Object.values(roster.data);
  const result = [];
  // Limited concurrency to avoid overloading Data Dragon.
  for (let i = 0; i < champions.length; i += 12) {
    const batch = await Promise.all(champions.slice(i, i + 12).map(async champion => {
      const detail = await json(`${CDN}/cdn/${version}/data/en_US/champion/${encodeURIComponent(champion.id)}.json`);
      const entry = detail.data[champion.id];
      return {
        id: entry.id, key: entry.key, name: entry.name, title: entry.title,
        tags: entry.tags, icon: `${CDN}/cdn/${version}/img/champion/${entry.image.full}`,
        skins: entry.skins.map(skin => ({
          id: skin.id, num: skin.num, name: skin.name === "default" ? `Classic ${entry.name}` : skin.name,
          splash: `${CDN}/cdn/img/champion/splash/${entry.id}_${skin.num}.jpg`,
          loading: `${CDN}/cdn/img/champion/loading/${entry.id}_${skin.num}.jpg`,
          isBase: skin.num === 0
        }))
      };
    }));
    result.push(...batch);
  }
  catalogCache = { version, championCount: result.length, skinCount: result.reduce((n,c)=>n+c.skins.length,0), champions: result };
  cacheUntil = Date.now() + 6 * 60 * 60 * 1000;
  return catalogCache;
}
app.get("/api/catalog", async (req,res) => {
  try { res.json(await getCatalog()); }
  catch(e) { console.error(e); res.status(502).json({error:"Unable to load Riot Data Dragon catalog",details:e.message}); }
});
app.get("/api/champions", async (req,res) => {
  try { const data = await getCatalog(); res.json({version:data.version,champions:data.champions.map(({skins,...champion})=>({...champion,skinCount:skins.length}))}); }
  catch(e) { res.status(502).json({error:e.message}); }
});
app.get("/api/champions/:id/skins", async (req,res) => {
  try { const data = await getCatalog(); const champion = data.champions.find(c=>c.id.toLowerCase()===req.params.id.toLowerCase()); if(!champion)return res.status(404).json({error:"Champion not found"}); res.json({version:data.version,...champion}); }
  catch(e) { res.status(502).json({error:e.message}); }
});
const REGIONS = {br1:"americas",la1:"americas",la2:"americas",na1:"americas",eun1:"europe",euw1:"europe",tr1:"europe",ru:"europe",jp1:"asia",kr:"asia",oc1:"sea",sg2:"sea",tw2:"sea",vn2:"sea",ph2:"sea",th2:"sea"};
app.get("/riot/account", async (req,res)=>{
  const {gameName,tagLine,server}=req.query;
  if(!gameName||!tagLine||!REGIONS[server])return res.status(400).json({error:"Valid Riot ID and server required"});
  if(!process.env.RIOT_API_KEY)return res.status(503).json({error:"RIOT_API_KEY is not configured"});
  try {
    const headers={"X-Riot-Token":process.env.RIOT_API_KEY};
    const account=await json(`https://${REGIONS[server]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,{headers});
    const summoner=await json(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`,{headers});
    res.json({gameName:account.gameName,tagLine:account.tagLine,puuid:account.puuid,profileIconId:summoner.profileIconId,summonerLevel:summoner.summonerLevel});
  } catch(e) { res.status(502).json({error:e.message}); }
});
app.use(express.static(__dirname));
app.listen(process.env.PORT||2106,()=>console.log("Project X ready"));
