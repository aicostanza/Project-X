(function(){
const main=document.querySelector("body > main") || document.createElement("main");
if(!main.parentNode)document.body.appendChild(main);
main.className="min-h-screen px-6 py-10 md:px-14 text-slate-100";
main.innerHTML=`<header class="max-w-7xl mx-auto mb-8"><p class="text-amber-500 uppercase tracking-[.3em] text-xs">Project X / League of Legends</p><h1 class="text-4xl font-bold mt-2">Champions & Skins</h1><p id="catalog-status" class="text-slate-400 mt-3">Loading live Riot Data Dragon catalog…</p></header><section class="max-w-7xl mx-auto"><div class="flex flex-wrap gap-3 mb-6"><input id="catalog-search" placeholder="Search champions or skins…" class="bg-slate-800 border border-slate-700 rounded-lg p-3 flex-1 min-w-48 text-white"><select id="catalog-champion" class="bg-slate-800 rounded-lg p-3"><option value="">All champions</option></select><select id="catalog-type" class="bg-slate-800 rounded-lg p-3"><option value="all">All skins</option><option value="skins">Skins only</option><option value="base">Classic only</option></select></div><div id="catalog-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"></div><button id="catalog-more" class="hidden mt-8 mx-auto block bg-amber-700 hover:bg-amber-600 px-8 py-3 rounded-lg">Load more</button></section>`;
const search=main.querySelector("#catalog-search"),select=main.querySelector("#catalog-champion"),type=main.querySelector("#catalog-type"),grid=main.querySelector("#catalog-grid"),more=main.querySelector("#catalog-more"),status=main.querySelector("#catalog-status");
let all=[],filtered=[],shown=0;
function draw(reset=true){
 if(reset){shown=0;grid.replaceChildren();}
 const q=search.value.toLocaleLowerCase().trim();
 filtered=all.filter(x=>(!select.value||x.championId===select.value)&&(type.value==="all"||(type.value==="base"?x.isBase:!x.isBase))&&(!q||x.name.toLocaleLowerCase().includes(q)||x.champion.toLocaleLowerCase().includes(q)));
 const slice=filtered.slice(shown,shown+40);shown+=slice.length;
 const fragment=document.createDocumentFragment();
 for(const skin of slice){
  const card=document.createElement("article");card.className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800";
  const img=document.createElement("img");img.src=skin.loading;img.alt=skin.name;img.loading="lazy";img.className="w-full h-64 object-cover";img.onerror=()=>{img.src=skin.splash;};
  const content=document.createElement("div");content.className="p-3";
  const name=document.createElement("h3");name.className="font-semibold";name.textContent=skin.name;
  const sub=document.createElement("p");sub.className="text-slate-400 text-sm";sub.textContent=skin.champion;
  content.append(name,sub);card.append(img,content);fragment.append(card);
 }
 grid.append(fragment);more.classList.toggle("hidden",shown>=filtered.length);
 status.textContent=`${filtered.length.toLocaleString()} results · ${all.length.toLocaleString()} total appearances including classic skins`;
}
more.addEventListener("click",()=>draw(false));
[search,select,type].forEach(el=>el.addEventListener(el===search?"input":"change",()=>draw()));
fetch("/api/catalog").then(r=>{if(!r.ok)throw Error("Catalog API returned "+r.status);return r.json();}).then(data=>{
 all=data.champions.flatMap(c=>c.skins.map(s=>({...s,champion:c.name,championId:c.id})));
 for(const c of data.champions){const o=document.createElement("option");o.value=c.id;o.textContent=c.name;select.append(o);}
 draw();status.textContent+=` · ${data.championCount} champions · patch ${data.version}`;
}).catch(e=>{status.textContent="Catalog failed to load: "+e.message;});
})();