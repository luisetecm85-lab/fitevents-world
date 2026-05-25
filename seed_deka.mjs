import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVJe1QFCRQDDUBh4Xs4GH27VeyKq3uA0s",
  authDomain: "fitevents-world.firebaseapp.com",
  projectId: "fitevents-world",
  storageBucket: "fitevents-world.firebasestorage.app",
  messagingSenderId: "34401442553",
  appId: "1:34401442553:web:90b99d5cc7c4bbb7956028"
};

const DEKA_EVENTS = [
  // ABRIL
  {id:600,name:"Deka Fit Valencia 2026",disc:"Hyrox",city:"Valencia",prov:"Valencia",country:"España",date:"2026-04-18",price:65,fmts:["Individual"],desc:"Deka Fit en Tinglado 2, Marina de Valencia. 10 estaciones funcionales + 5km de carrera. Modalidades: Deka Fit, Deka Mile, Deka Fit Teams y Deka Mile Teams.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:601,name:"Deka Fit Teams Valencia 2026",disc:"Hyrox",city:"Valencia",prov:"Valencia",country:"España",date:"2026-04-18",price:50,fmts:["Parejas"],desc:"Deka Fit Teams en Tinglado 2, Marina de Valencia. Competición por relevos en parejas.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:602,name:"Deka Mile Valencia 2026",disc:"Hyrox",city:"Valencia",prov:"Valencia",country:"España",date:"2026-04-19",price:45,fmts:["Individual"],desc:"Deka Mile en Tinglado 2, Marina de Valencia. Versión reducida del Deka Fit.",feat:false,verified:false,ratings:[],attendance:[]},
  // MAYO
  {id:603,name:"Deka Fit Sevilla 2026",disc:"Hyrox",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-05-16",price:60,fmts:["Individual"],desc:"Primera edición de Deka Fit en Sevilla. Av. Alcalde Luis Uruñuela. 10 estaciones funcionales + 5km de carrera.",feat:true,verified:false,ratings:[],attendance:[]},
  // JUNIO
  {id:604,name:"Deka Mile Teams Vigo 2026",disc:"Hyrox",city:"Vigo",prov:"Pontevedra",country:"España",date:"2026-06-27",price:40,fmts:["Parejas"],desc:"Deka Mile Teams en Vigo. Competición por relevos en parejas.",feat:false,verified:false,ratings:[],attendance:[]},
  // JULIO
  {id:605,name:"Deka Fit Madrid 2026",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-07-18",price:60,fmts:["Individual"],desc:"Deka Fit en Madrid Arena. 10 estaciones funcionales + 5km de carrera en uno de los recintos más emblemáticos de Madrid.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:606,name:"Deka Mile Madrid 2026",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-07-18",price:40,fmts:["Individual"],desc:"Deka Mile en Madrid Arena. Versión reducida del Deka Fit.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:607,name:"Deka Strong Madrid 2026",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-07-18",price:45,fmts:["Individual"],desc:"Deka Strong en Madrid Arena. Modalidad de fuerza del circuito Deka.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:608,name:"Deka Fit Teams Madrid 2026",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-07-19",price:60,fmts:["Parejas"],desc:"Deka Fit Teams en Madrid Arena. Competición por relevos en parejas.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:609,name:"Deka Mile Teams Madrid 2026",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-07-19",price:60,fmts:["Parejas"],desc:"Deka Mile Teams en Madrid Arena.",feat:false,verified:false,ratings:[],attendance:[]},
  // SEPTIEMBRE
  {id:610,name:"Deka Fit Braga 2026",disc:"Hyrox",city:"Braga",prov:"Portugal",country:"Portugal",date:"2026-09-12",price:65,fmts:["Individual"],desc:"Deka Fit en Braga, Portugal. 10 estaciones funcionales + 5km de carrera.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:611,name:"Deka Fit Teams Braga 2026",disc:"Hyrox",city:"Braga",prov:"Portugal",country:"Portugal",date:"2026-09-12",price:65,fmts:["Parejas"],desc:"Deka Fit Teams en Braga, Portugal.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:612,name:"Deka Mile Braga 2026",disc:"Hyrox",city:"Braga",prov:"Portugal",country:"Portugal",date:"2026-09-12",price:45,fmts:["Individual"],desc:"Deka Mile en Braga, Portugal.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:613,name:"Deka Fit Barcelona 2026",disc:"Hyrox",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-09-27",price:80,fmts:["Individual"],desc:"Deka Fit en Barcelona. 10 estaciones funcionales + 5km de carrera.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:614,name:"Deka Fit Teams Barcelona 2026",disc:"Hyrox",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-09-26",price:60,fmts:["Parejas"],desc:"Deka Fit Teams en Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:615,name:"Deka Mile Teams Barcelona 2026",disc:"Hyrox",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-09-26",price:45,fmts:["Parejas"],desc:"Deka Mile Teams en Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCTUBRE
  {id:616,name:"Deka Fit Guadalajara 2026",disc:"Hyrox",city:"Guadalajara",prov:"Guadalajara",country:"España",date:"2026-10-24",price:60,fmts:["Individual"],desc:"Deka Fit en Guadalajara. 10 estaciones funcionales + 5km de carrera.",feat:true,verified:false,ratings:[],attendance:[]},
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log(`Seeding ${DEKA_EVENTS.length} Deka events...`);
  const snap = await getDocs(collection(db, 'events'));
  const batch = writeBatch(db);
  DEKA_EVENTS.forEach(ev => {
    const existing = snap.docs.find(d => d.id === String(ev.id));
    const merged = { ...ev, ...(existing ? { ratings: existing.data().ratings || [], attendance: existing.data().attendance || [] } : {}) };
    batch.set(doc(db, 'events', String(ev.id)), merged);
  });
  await batch.commit();
  console.log(`Done! ${DEKA_EVENTS.length} Deka events added.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
