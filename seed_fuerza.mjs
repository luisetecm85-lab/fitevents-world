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

const FUERZA_EVENTS = [
  // POWERLIFTING - AEP3 (competiciones locales/regionales)
  {id:500,name:"AEP3 Powerlifting Málaga 2026",disc:"Fuerza",city:"Málaga",prov:"Málaga",country:"España",date:"2026-02-07",price:30,fmts:["Individual"],desc:"Competición de Powerlifting AEP3 en Málaga. Modalidades: Powerlifting y Press Banca. Abierto a todos los niveles.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:501,name:"AEP3 Powerlifting Vitoria 2026",disc:"Fuerza",city:"Vitoria",prov:"Alava",country:"España",date:"2026-02-21",price:30,fmts:["Individual"],desc:"Competición de Powerlifting AEP3 en Vitoria. Modalidades: Powerlifting y Press Banca.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:502,name:"AEP3 Powerlifting Murcia 2026",disc:"Fuerza",city:"Murcia",prov:"Murcia",country:"España",date:"2026-03-21",price:30,fmts:["Individual"],desc:"Competición de Powerlifting AEP3 en Murcia. Modalidades: Powerlifting y Press Banca.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:503,name:"AEP3 Powerlifting Tarragona 2026",disc:"Fuerza",city:"Tarragona",prov:"Tarragona",country:"España",date:"2026-03-28",price:30,fmts:["Individual"],desc:"Competición de Powerlifting AEP3 en Tarragona organizada por la Federación Catalana.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:504,name:"AEP3 Powerlifting Gijón 2026",disc:"Fuerza",city:"Gijón",prov:"Asturias",country:"España",date:"2026-03-28",price:30,fmts:["Individual"],desc:"Competición de Powerlifting AEP3 en Gijón. Modalidades: Powerlifting y Press Banca.",feat:false,verified:false,ratings:[],attendance:[]},
  // POWERLIFTING - AEP2 (competiciones regionales de nivel medio)
  {id:505,name:"Andalucía Energy Cup Powerlifting 2026",disc:"Fuerza",city:"Málaga",prov:"Málaga",country:"España",date:"2026-04-11",price:35,fmts:["Individual"],desc:"Campeonato regional de Powerlifting Andalucía - Energy Cup en Málaga.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:506,name:"Campeonato Noroeste Powerlifting 2026",disc:"Fuerza",city:"Ferrol",prov:"Asturias",country:"España",date:"2026-04-25",price:35,fmts:["Individual"],desc:"Campeonato regional de Powerlifting Noroeste (Asturias, Galicia, Castilla y León) en Ferrol.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:507,name:"Clasificatorio Nacional Powerlifting 2026",disc:"Fuerza",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-05",price:40,fmts:["Individual"],desc:"Clasificatorio Nacional de Powerlifting Equipado en Madrid. Plazas para Copa y Absoluto.",feat:true,verified:false,ratings:[],attendance:[]},
  // POWERLIFTING - AEP1 (campeonatos nacionales)
  {id:508,name:"Campeonato de España Powerlifting Press Banca 2026",disc:"Fuerza",city:"Por confirmar",prov:"Madrid",country:"España",date:"2026-03-15",price:45,fmts:["Individual"],desc:"Campeonato de España de Press Banca y Peso Muerto AEP1. Open, categorías por peso.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:509,name:"Campeonato de España Powerlifting Masters 2026",disc:"Fuerza",city:"Por confirmar",prov:"Madrid",country:"España",date:"2026-04-15",price:45,fmts:["Individual"],desc:"Campeonato de España de Powerlifting Masters AEP1. Divisiones Master 1, 2, 3 y 4.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:510,name:"Campeonato de España Powerlifting Junior 2026",disc:"Fuerza",city:"Por confirmar",prov:"Madrid",country:"España",date:"2026-07-15",price:45,fmts:["Individual"],desc:"Campeonato de España de Powerlifting Junior AEP1. Hasta 23 años.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:511,name:"Copa de España Powerlifting 2026",disc:"Fuerza",city:"Por confirmar",prov:"Madrid",country:"España",date:"2026-10-15",price:45,fmts:["Individual"],desc:"Copa de España de Powerlifting AEP1. Open, modalidades Powerlifting y Press Banca.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:512,name:"Campeonato de España Powerlifting Absoluto 2026",disc:"Fuerza",city:"Por confirmar",prov:"Madrid",country:"España",date:"2026-11-15",price:45,fmts:["Individual"],desc:"Campeonato de España Absoluto de Powerlifting AEP1. El evento más importante del año.",feat:true,verified:false,ratings:[],attendance:[]},
  // HALTEROFILIA
  {id:513,name:"Campeonato España Halterofilia Máster 2026",disc:"Fuerza",city:"Santa María del Águila",prov:"Almería",country:"España",date:"2026-05-15",price:40,fmts:["Individual"],desc:"Campeonato de España de Halterofilia Máster Individual. +35 años. ~300 atletas participantes.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:514,name:"Copa España Halterofilia Máster 2026",disc:"Fuerza",city:"Gandia",prov:"Valencia",country:"España",date:"2026-10-10",price:40,fmts:["Individual"],desc:"IX Copa de España y IX Campeonato de España por Federaciones de Halterofilia Máster en Gandia.",feat:true,verified:false,ratings:[],attendance:[]},
  // STRONGMAN / OTROS EVENTOS DE FUERZA
  {id:515,name:"Trofeo Levantamiento Piedra Vasca Madrid 2026",disc:"Fuerza",city:"Madrid",prov:"Madrid",country:"España",date:"2026-02-21",price:20,fmts:["Individual"],desc:"Trofeo de levantamiento de piedra vasca (Harrijasotze) en Madrid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:516,name:"IBI Strength Showdown Parejas 2026",disc:"Fuerza",city:"Ibi",prov:"Alicante",country:"España",date:"2026-06-13",price:130,fmts:["Parejas"],desc:"IBI Strength Showdown 2026 en Ibi, Alicante. Competición de fuerza en parejas.",feat:true,verified:false,ratings:[],attendance:[]},
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log(`Seeding ${FUERZA_EVENTS.length} Fuerza events...`);
  const snap = await getDocs(collection(db, 'events'));
  const batch = writeBatch(db);
  FUERZA_EVENTS.forEach(ev => {
    const existing = snap.docs.find(d => d.id === String(ev.id));
    const merged = { ...ev, ...(existing ? { ratings: existing.data().ratings || [], attendance: existing.data().attendance || [] } : {}) };
    batch.set(doc(db, 'events', String(ev.id)), merged);
  });
  await batch.commit();
  console.log(`Done! ${FUERZA_EVENTS.length} Fuerza events added.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
