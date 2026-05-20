import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVJe1QFCRQDDUBh4Xs4GH27VeyKq3uA0s",
  authDomain: "fitevents-world.firebaseapp.com",
  projectId: "fitevents-world",
  storageBucket: "fitevents-world.firebasestorage.app",
  messagingSenderId: "34401442553",
  appId: "1:34401442553:web:90b99d5cc7c4bbb7956028"
};

// 37 new events (ids 251-287)
const NEW_EVENTS=[
  {id:251,name:"Battle Of The Season - edición primavera/verano",disc:"CrossFit",city:"Almeria",prov:"Almeria",country:"España",date:"2026-06-27",price:90,fmts:["Trios"],desc:"Battle Of The Season - edición primavera/verano en Almeria, España.",feat:true,verified:false,ratings:[]},
  {id:252,name:"Gijón Throwdown 2026",disc:"CrossFit",city:"Gijón",prov:"Asturias",country:"España",date:"2026-09-27",price:420,fmts:["Cuartetos"],desc:"Gijón Throwdown 2026 en Gijón, España.",url:"https://gijonthrowdown.es/",feat:true,verified:false,ratings:[]},
  {id:253,name:"STYGIA FITTEST 2026",disc:"CrossFit",city:"Móstoles",prov:"Madrid",country:"España",date:"2026-05-30",price:0,fmts:["Parejas"],desc:"STYGIA FITTEST 2026 en Móstoles, España.",feat:false,verified:false,ratings:[]},
  {id:254,name:"Cierzo Hybrid Club",disc:"CrossFit",city:"Zaragoza",prov:"Zaragoza",country:"España",date:"2026-05-31",price:0,fmts:["Parejas"],desc:"Cierzo Hybrid Club en Zaragoza, España.",url:"https://cierzo.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:255,name:"La Batalla de Aceró 2026 La Palma",disc:"CrossFit",city:"Los Llanos de Aridane",prov:"Tenerife",country:"España",date:"2026-06-27",price:270,fmts:["Trios"],desc:"La Batalla de Aceró 2026 La Palma en Los Llanos de Aridane, España.",url:"https://labatalladeacero.com/",feat:true,verified:false,ratings:[]},
  {id:256,name:"Sol Games '26",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-05-31",price:120,fmts:["Parejas"],desc:"Sol Games '26 en Sevilla, España.",url:"https://lemonbox.wodbuster.com/",feat:true,verified:false,ratings:[]},
  {id:257,name:"PAMPLONA ARENA GAMES 26 ELITE",disc:"CrossFit",city:"Pamplona",prov:"Navarra",country:"España",date:"2026-11-15",price:10,fmts:["Individual"],desc:"PAMPLONA ARENA GAMES 26 ELITE en Pamplona, España.",url:"https://pamplonaarenagames.net/",feat:true,verified:false,ratings:[]},
  {id:258,name:"ULTIMATE ATHLETE",disc:"CrossFit",city:"Villanueva de Mesía",prov:"Granada",country:"España",date:"2026-06-27",price:40,fmts:["Trios"],desc:"ULTIMATE ATHLETE en Villanueva de Mesía, España.",feat:true,verified:false,ratings:[]},
  {id:259,name:"Legio CHALLENGE",disc:"CrossFit",city:"León",prov:"Leon",country:"España",date:"2026-06-06",price:0,fmts:["Parejas"],desc:"Legio CHALLENGE en León, España.",url:"https://legio.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:260,name:"ANIMAPALOOZA 2026",disc:"CrossFit",city:"Montijo",prov:"Badajoz",country:"España",date:"2026-06-06",price:30,fmts:["Parejas"],desc:"ANIMAPALOOZA 2026 en Montijo, España.",url:"https://anima.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:261,name:"Alfa Hero Fitness 2026 (CUERDA Y PRESS)",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-21",price:15,fmts:["Individual"],desc:"Alfa Hero Fitness 2026 (CUERDA Y PRESS) en Madrid, España.",url:"https://alfahero.wodbuster.com/",feat:true,verified:false,ratings:[]},
  {id:262,name:"Project Nakama",disc:"CrossFit",city:"Melilla",prov:"Melilla",country:"España",date:"2026-06-07",price:0,fmts:["Parejas"],desc:"Project Nakama en Melilla, España.",url:"https://nakamaboxcrew.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:263,name:"INTERBOX KOXKA 2026 (LEIOA)",disc:"CrossFit",city:"Leioa",prov:"Bizkaia",country:"España",date:"2026-06-07",price:60,fmts:["Parejas"],desc:"INTERBOX KOXKA 2026 (LEIOA) en Leioa, España.",url:"https://koxkaleioa.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:264,name:"MARESME GAMES",disc:"CrossFit",city:"El Masnou",prov:"Barcelona",country:"España",date:"2026-07-11",price:100,fmts:["Parejas"],desc:"MARESME GAMES en El Masnou, España.",feat:true,verified:false,ratings:[]},
  {id:265,name:"Summer Bellum",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-14",price:0,fmts:["Cuartetos"],desc:"Summer Bellum en Madrid, España.",url:"https://bellum.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:266,name:"Txapeltxiki Erandio",disc:"CrossFit",city:"Erandio",prov:"Bizkaia",country:"España",date:"2026-06-20",price:100,fmts:["Trios"],desc:"Txapeltxiki Erandio en Erandio, España.",url:"https://bctxapelketa.com/",feat:true,verified:false,ratings:[]},
  {id:267,name:"Barba box league",disc:"CrossFit",city:"Pedrera",prov:"Sevilla",country:"España",date:"2026-06-17",price:0,fmts:["Parejas"],desc:"Barba box league en Pedrera, España.",url:"https://barbabox.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:268,name:"oikos games",disc:"CrossFit",city:"Mataró",prov:"Barcelona",country:"España",date:"2026-06-27",price:40,fmts:["Parejas"],desc:"oikos games en Mataró, España.",url:"https://oikostraining.com/",feat:true,verified:false,ratings:[]},
  {id:269,name:"Core A2",disc:"CrossFit",city:"Cártama",prov:"Malaga",country:"España",date:"2026-06-19",price:0,fmts:["Individual"],desc:"Core A2 en Cártama, España.",url:"https://a2training.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:270,name:"THE GETSTRONG CHAMPIONSHIP",disc:"CrossFit",city:"Ávila",prov:"Avila",country:"España",date:"2026-06-21",price:300,fmts:["Trios"],desc:"THE GETSTRONG CHAMPIONSHIP en Ávila, España.",url:"http://www.getstrong.es/",feat:true,verified:false,ratings:[]},
  {id:271,name:"LIGA KAIZEN 2025-2026",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-27",price:0,fmts:["Cuartetos"],desc:"LIGA KAIZEN 2025-2026 en Madrid, España.",feat:true,verified:false,ratings:[]},
  {id:272,name:"SUMMER GAMES 2026",disc:"CrossFit",city:"Montserrat",prov:"Valencia",country:"España",date:"2026-06-27",price:0,fmts:["Cuartetos"],desc:"SUMMER GAMES 2026 en Montserrat, España.",url:"https://boxmontserrat.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:273,name:"V Valley Games",disc:"CrossFit",city:"Moaña",prov:"Pontevedra",country:"España",date:"2026-06-27",price:0,fmts:["Trios"],desc:"V Valley Games en Moaña, España.",url:"https://labodegaboxporrino.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:274,name:"PRIME SUMMER GAMES 2026",disc:"CrossFit",city:"Alcorcón",prov:"Madrid",country:"España",date:"2026-07-04",price:100,fmts:["Parejas"],desc:"PRIME SUMMER GAMES 2026 en Alcorcón, España.",url:"https://www.primemadriz.com/",feat:true,verified:false,ratings:[]},
  {id:275,name:"The Fittest Games OX 26' Summer edition",disc:"CrossFit",city:"Cambrils",prov:"Tarragona",country:"España",date:"2026-07-11",price:0,fmts:["Trios"],desc:"The Fittest Games OX 26' Summer edition en Cambrils, España.",feat:true,verified:false,ratings:[]},
  {id:276,name:"T3 BOX",disc:"CrossFit",city:"BETERA",prov:"Valencia",country:"España",date:"2026-08-01",price:0,fmts:["Individual"],desc:"T3 BOX en BETERA, España.",url:"https://t3.wodbuster.com/",feat:false,verified:false,ratings:[]},
  {id:277,name:"Motion Fitness League ‘26",disc:"CrossFit",city:"Ciudad Real",prov:"Ciudad Real",country:"España",date:"2026-09-27",price:165,fmts:["Trios"],desc:"Motion Fitness League ‘26 en Ciudad Real, España.",feat:true,verified:false,ratings:[]},
  {id:278,name:"VYRON HYBRID",disc:"CrossFit",city:"Riogordo",prov:"Malaga",country:"España",date:"2026-09-05",price:40,fmts:["Trios"],desc:"VYRON HYBRID en Riogordo, España.",feat:true,verified:false,ratings:[]},
  {id:279,name:"SOUTH GAMES",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-10-18",price:130,fmts:["Parejas"],desc:"SOUTH GAMES en Sevilla, España.",feat:true,verified:false,ratings:[]},
  {id:280,name:"NorthFit Hybrid 2026",disc:"CrossFit",city:"Donostia",prov:"Guipuzcoa",country:"España",date:"2026-10-03",price:65,fmts:["Trios"],desc:"NorthFit Hybrid 2026 en Donostia, España.",feat:true,verified:false,ratings:[]},
  {id:281,name:"ANDALUSI CHALLENGER 2026",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-10-31",price:250,fmts:["Trios"],desc:"ANDALUSI CHALLENGER 2026 en Sevilla, España.",url:"https://www.crossfitlaforja.com/",feat:true,verified:false,ratings:[]},
  {id:282,name:"Cádiz Throwdown 2026",disc:"CrossFit",city:"Cádiz",prov:"Cadiz",country:"España",date:"2026-09-13",price:210,fmts:["Trios"],desc:"Cádiz Throwdown 2026 en Cádiz, España.",feat:true,verified:false,ratings:[]},
  {id:283,name:"Txapeltxiki Laudio",disc:"CrossFit",city:"Laudio",prov:"Alava",country:"España",date:"2026-09-26",price:100,fmts:["Trios"],desc:"Txapeltxiki Laudio en Laudio, España.",url:"https://bctxapelketa.com/",feat:false,verified:false,ratings:[]},
  {id:284,name:"WODFEST SALOU",disc:"CrossFit",city:"Salou",prov:"Tarragona",country:"España",date:"2026-11-08",price:330,fmts:["Trios"],desc:"WODFEST SALOU en Salou, España.",url:"https://www.wodfestevent.com/",feat:true,verified:false,ratings:[]},
  {id:285,name:"WOD GAMES LA CARLOTA 2026",disc:"CrossFit",city:"LA CARLOTA",prov:"Cordoba",country:"España",date:"2026-11-15",price:100,fmts:["Parejas"],desc:"WOD GAMES LA CARLOTA 2026 en LA CARLOTA, España.",url:"https://lacarlotadeportes.blogspot.com/",feat:true,verified:false,ratings:[]},
  {id:286,name:"CFHK LEAGUE 2026",disc:"CrossFit",city:"Gernika",prov:"Bizkaia",country:"España",date:"2026-10-24",price:130,fmts:["Cuartetos"],desc:"CFHK LEAGUE 2026 en Gernika, España.",url:"https://cfhk.eu/",feat:true,verified:false,ratings:[]},
  {id:287,name:"Isla Bonita League 2026",disc:"CrossFit",city:"Santa Cruz de la Palma",prov:"Tenerife",country:"España",date:"2026-12-19",price:0,fmts:["Trios"],desc:"Isla Bonita League 2026 en Santa Cruz de la Palma, España.",feat:true,verified:false,ratings:[]}
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log(`Adding ${NEW_EVENTS.length} new events...`);
  const chunks = [];
  for (let i = 0; i < NEW_EVENTS.length; i += 400) {
    chunks.push(NEW_EVENTS.slice(i, i + 400));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(ev => {
      batch.set(doc(db, 'events', String(ev.id)), ev);
    });
    await batch.commit();
    console.log(`Batch of ${chunk.length} events written`);
  }
  console.log(`Done! ${NEW_EVENTS.length} new events added.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
