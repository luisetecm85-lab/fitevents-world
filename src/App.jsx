import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import emailjs from '@emailjs/browser'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { db, auth } from './firebase'
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth'
function useIsMobile(){const[m,setM]=useState(window.innerWidth<768);useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);return m;}

const DISC_COLORS={CrossFit:"#FF6500",Hyrox:"#4DA6FF",OCR:"#4CAF50",Fuerza:"#B56AFF","Fitness Funcional":"#FFB300"};
const DISCIPLINES=["Todos","CrossFit","Hyrox","OCR","Fuerza","Fitness Funcional"];
const FORMATS=["Individual","Parejas","Trios","Cuartetos","Equipos +4"];
const SCORE_KEYS=["precio","dificultad","organizacion","ambiente","categorias","accesibilidad","espacio"];
const SLABELS={precio:"Precio/calidad",dificultad:"Dificultad adecuada",organizacion:"Organización",ambiente:"Ambiente",categorias:"Categorías",accesibilidad:"Accesibilidad",espacio:"Espacio"};
const STOOLTIPS={precio:"¿El precio de inscripción está justificado con lo que ofrece el evento?",dificultad:"¿El nivel de dificultad fue el prometido por el organizador?",organizacion:"Logística, comunicación, puntualidad y atención al participante.",ambiente:"Animación, música, público y energía general del evento.",categorias:"Variedad y adecuación de las categorías por nivel y formato.",accesibilidad:"Facilidad para llegar, aparcamiento y acceso al recinto.",espacio:"Calidad del recinto: estadio, pabellón, espacio exterior..."};
const ADS=[
  {id:1,brand:"PICSIL",claim:"Equipamiento tecnico para atletas de elite",cta:"Ver productos",url:"https://picsil.com",color:"#FF6500",logo:"💪"},
  {id:2,brand:"ON RUNNING",claim:"Zapatillas disenadas para rendimiento hibrido",cta:"Descubrir",url:"https://on-running.com",color:"#4DA6FF",logo:"👟"},
  {id:3,brand:"BAREBELLS",claim:"Proteina sin azucar. Sabor sin compromiso.",cta:"Probar ahora",url:"https://barebells.com",color:"#B56AFF",logo:"🍫"},
];

const PC={
  "Alava":{lat:42.85,lon:-2.67},"Albacete":{lat:38.99,lon:-1.86},"Alicante":{lat:38.35,lon:-0.48},
  "Almería":{lat:36.84,lon:-2.47},"Asturias":{lat:43.36,lon:-5.85},"Ávila":{lat:40.66,lon:-4.69},
  "Badajoz":{lat:38.88,lon:-6.97},"Baleares":{lat:39.57,lon:2.65},"Barcelona":{lat:41.39,lon:2.17},
  "Bizkaia":{lat:43.26,lon:-2.93},"Cantabria":{lat:43.18,lon:-3.99},"Castellón":{lat:39.99,lon:-0.05},
  "Ciudad Real":{lat:38.99,lon:-3.92},"Córdoba":{lat:37.89,lon:-4.78},"Cuenca":{lat:40.07,lon:-2.14},
  "Girona":{lat:41.98,lon:2.82},"Granada":{lat:37.18,lon:-3.60},"Guadalajara":{lat:40.63,lon:-3.16},
  "Guipuzcoa":{lat:43.31,lon:-2.00},"Huelva":{lat:37.26,lon:-6.95},"Huesca":{lat:42.14,lon:-0.41},
  "La Rioja":{lat:42.47,lon:-2.45},"Las Palmas":{lat:28.10,lon:-15.41},"León":{lat:42.60,lon:-5.57},
  "Lleida":{lat:41.62,lon:0.62},"Lugo":{lat:43.01,lon:-7.56},"Madrid":{lat:40.42,lon:-3.70},
  "Málaga":{lat:36.72,lon:-4.42},"Murcia":{lat:37.98,lon:-1.13},"Navarra":{lat:42.82,lon:-1.65},
  "Pontevedra":{lat:42.43,lon:-8.64},"Salamanca":{lat:40.97,lon:-5.66},"Tenerife":{lat:28.46,lon:-16.25},
  "Sevilla":{lat:37.39,lon:-5.99},"Tarragona":{lat:41.12,lon:1.25},"Valencia":{lat:39.47,lon:-0.37},
  "Valladolid":{lat:41.65,lon:-4.72},"Zamora":{lat:41.50,lon:-5.75},"Zaragoza":{lat:41.65,lon:-0.89},"Cáceres":{lat:39.47,lon:-6.37},"Ourense":{lat:42.34,lon:-7.86},"Teruel":{lat:40.34,lon:-1.10},"Jaén":{lat:37.77,lon:-3.79},"Segovia":{lat:40.94,lon:-4.12},"Burgos":{lat:42.34,lon:-3.70},"A Coruña":{lat:43.37,lon:-8.40},"Palencia":{lat:42.01,lon:-4.53},"Soria":{lat:41.76,lon:-2.46},"Huelva":{lat:37.26,lon:-6.95},"Cuenca":{lat:40.07,lon:-2.14},"Andorra":{lat:42.50,lon:1.52},"Ceuta":{lat:35.89,lon:-5.31},"Melilla":{lat:35.29,lon:-2.94},
  "Estocolmo":{lat:59.33,lon:18.07},"San Jose CA":{lat:37.34,lon:-121.89},
  "Toledo":{lat:39.86,lon:-4.02},"Cádiz":{lat:36.53,lon:-6.29},
  "Portugal":{lat:39.50,lon:-8.00},
  "Suecia":{lat:59.33,lon:18.07},
  "EEUU":{lat:37.34,lon:-121.89},
  "Gibraltar":{lat:36.14,lon:-5.35},
  "Francia":{lat:46.23,lon:2.21},
  "Alemania":{lat:51.17,lon:10.45},
  "Italia":{lat:41.87,lon:12.57},
  "Reino Unido":{lat:51.51,lon:-0.13},
  "Paises Bajos":{lat:52.13,lon:5.29},
  "Belgica":{lat:50.50,lon:4.47},
  "Suiza":{lat:46.82,lon:8.23},
  "Austria":{lat:47.52,lon:14.55},
  "Polonia":{lat:51.92,lon:19.15},
  "Republica Checa":{lat:49.82,lon:15.47},
  "Hungria":{lat:47.16,lon:19.50},
  "Grecia":{lat:39.07,lon:21.82},
  "Noruega":{lat:60.47,lon:8.47},
  "Dinamarca":{lat:56.26,lon:9.50},
  "Finlandia":{lat:61.92,lon:25.75},
  "Irlanda":{lat:53.41,lon:-8.24},
  "Mexico":{lat:23.63,lon:-102.55},
  "Brasil":{lat:-14.24,lon:-51.93},
  "Argentina":{lat:-38.42,lon:-63.62},
  "Colombia":{lat:4.57,lon:-74.30},
  "Australia":{lat:-25.27,lon:133.78},
  "Canada":{lat:56.13,lon:-106.35},
};

const EVENTS=[
  {id:1,name:"Hyrox Madrid",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2025-11-15",price:85,fmts:["Individual","Parejas"],desc:"IFEMA Madrid. Una de las citas Hyrox mas grandes de España.",feat:false,verified:true,ratings:[]},
  {id:2,name:"Hyrox Bilbao",disc:"Hyrox",city:"Bilbao",prov:"Bizkaia",country:"España",date:"2026-02-14",price:85,fmts:["Individual","Parejas"],desc:"BEC Bilbao Exhibition Centre.",feat:false,verified:true,ratings:[]},
  {id:3,name:"Hyrox Málaga",disc:"Hyrox",city:"Málaga",prov:"Málaga",country:"España",date:"2026-04-18",price:85,fmts:["Individual","Parejas"],desc:"FYCMA Málaga.",feat:false,verified:true,ratings:[]},
  {id:4,name:"Hyrox Barcelona",disc:"Hyrox",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-05-23",price:85,fmts:["Individual","Parejas"],desc:"Fira Gran Via Barcelona.",feat:true,verified:true,ratings:[]},
  {id:5,name:"CrossFit Open 2026",disc:"CrossFit",city:"Online",prov:"Madrid",country:"España",date:"2026-02-26",price:0,fmts:["Individual"],desc:"Open anual online.",feat:false,verified:true,ratings:[]},
  {id:6,name:"MAD Fitness Festival",disc:"CrossFit",city:"Ciudad Real",prov:"Ciudad Real",country:"España",date:"2026-05-01",price:120,fmts:["Individual","Parejas","Trios"],desc:"Semifinal europea oficial de CrossFit.",feat:true,verified:true,ratings:[]},
  {id:7,name:"Wodcelona",disc:"CrossFit",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-09-12",price:95,fmts:["Individual","Parejas"],desc:"El evento mas especial del ano en España.",feat:true,verified:true,ratings:[]},
  {id:8,name:"NorthFit Zarautz 2026",disc:"CrossFit",city:"Zarautz",prov:"Guipuzcoa",country:"España",date:"2026-01-17",price:300,fmts:["Trios"],desc:"Equipos de 3 en la costa vasca.",feat:true,verified:true,ratings:[]},
  {id:9,name:"Spartan Race Madrid",disc:"OCR",city:"Madrid",prov:"Madrid",country:"España",date:"2026-05-16",price:75,fmts:["Individual"],desc:"Obstaculos en los alrededores de Madrid.",feat:false,verified:false,ratings:[]},
  {id:10,name:"Spartan Race Barcelona",disc:"OCR",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-10-03",price:75,fmts:["Individual"],desc:"Edicion otonal en la costa catalana.",feat:false,verified:false,ratings:[]},
  {id:11,name:"Campeonato Nacional OCR",disc:"OCR",city:"Madrid",prov:"Madrid",country:"España",date:"2026-05-09",price:55,fmts:["Individual","Parejas"],desc:"Campeonato nacional OCR Olympus.",feat:false,verified:false,ratings:[]},
  {id:12,name:"Hyrox World Championships",disc:"Hyrox",city:"Estocolmo",prov:"Suecia",country:"Suecia",date:"2026-06-06",price:150,fmts:["Individual","Parejas"],desc:"Campeonato mundial en Estocolmo.",feat:true,verified:true,ratings:[]},
  {id:13,name:"CrossFit Games 2026",disc:"CrossFit",city:"San Jose",prov:"EEUU",country:"EEUU",date:"2026-07-25",price:200,fmts:["Individual"],desc:"El evento mas importante del crossfit mundial.",feat:true,verified:true,ratings:[]},
  {id:14,name:"Valencia Throwdown 2026",disc:"CrossFit",city:"La Eliana",prov:"Valencia",country:"España",date:"2026-06-05",price:85,fmts:["Individual","Parejas","Trios","Cuartetos"],desc:"Uno de los throwdowns mas importantes de España.",feat:true,verified:true,ratings:[]},
  {id:15,name:"Basque CrossFit Txapelketa 2025",disc:"CrossFit",city:"Bilbao",prov:"Bizkaia",country:"España",date:"2025-11-01",price:120,fmts:["Individual","Cuartetos"],desc:"El campeonato vasco de CrossFit.",feat:true,verified:true,ratings:[]},
  {id:16,name:"Pamplona Arena Games",disc:"CrossFit",city:"Pamplona",prov:"Navarra",country:"España",date:"2026-02-08",price:200,fmts:["Individual","Parejas","Cuartetos","Equipos +4"],desc:"Evento espectacular en Navarra Arena.",feat:true,verified:true,ratings:[]},
  {id:17,name:"The Battle Games X",disc:"CrossFit",city:"Almassora",prov:"Castellón",country:"España",date:"2026-04-24",price:120,fmts:["Individual","Parejas","Trios","Cuartetos"],desc:"Decima edicion del Battle Games en Castellón.",feat:true,verified:false,ratings:[]},
  {id:18,name:"Meteor Games",disc:"CrossFit",city:"Cabanillas",prov:"Guadalajara",country:"España",date:"2025-10-04",price:120,fmts:["Parejas"],desc:"Evento de parejas en Guadalajara.",feat:true,verified:false,ratings:[]},
  {id:19,name:"February Challenge León",disc:"CrossFit",city:"León",prov:"León",country:"España",date:"2026-01-30",price:300,fmts:["Trios","Equipos +4"],desc:"El reto de febrero en León.",feat:true,verified:false,ratings:[]},
  {id:20,name:"Vera Summer Showdown",disc:"CrossFit",city:"Vera",prov:"Almería",country:"España",date:"2026-05-23",price:75,fmts:["Individual"],desc:"Throwdown en Vera, Almería.",feat:false,verified:false,ratings:[]},
  {id:21,name:"Invitacional YCOD 2026",disc:"CrossFit",city:"Icod de Los Vinos",prov:"Tenerife",country:"España",date:"2026-04-18",price:150,fmts:["Cuartetos"],desc:"Invitacional en Tenerife.",feat:true,verified:false,ratings:[]},
  {id:22,name:"Delta Games Ebre",disc:"CrossFit",city:"Amposta",prov:"Tarragona",country:"España",date:"2026-03-20",price:50,fmts:["Individual"],desc:"Evento en el delta del Ebro.",feat:false,verified:false,ratings:[]},
  {id:23,name:"Festival Team Games Alicante",disc:"CrossFit",city:"Dolores",prov:"Alicante",country:"España",date:"2026-03-14",price:200,fmts:["Parejas","Trios","Cuartetos"],desc:"Festival de equipos en Alicante.",feat:true,verified:false,ratings:[]},
  {id:24,name:"The Alhambra Games 2026",disc:"CrossFit",city:"Durcal",prov:"Granada",country:"España",date:"2026-02-27",price:150,fmts:["Individual","Trios"],desc:"Uno de los eventos mas reconocidos del sur.",feat:true,verified:false,ratings:[]},
  {id:25,name:"Wave Lift Off",disc:"Fuerza",city:"Aguilas",prov:"Murcia",country:"España",date:"2026-03-28",price:50,fmts:["Individual"],desc:"Evento de fuerza en Aguilas, Murcia.",feat:true,verified:false,ratings:[]},
  {id:26,name:"HRX Alicante Test Hyrox",disc:"Hyrox",city:"Alicante",prov:"Alicante",country:"España",date:"2026-03-28",price:80,fmts:["Individual","Parejas","Cuartetos"],desc:"Test Hyrox oficial en Alicante.",feat:true,verified:false,ratings:[]},
  {id:27,name:"CrossGames Almansa",disc:"CrossFit",city:"Almansa",prov:"Albacete",country:"España",date:"2026-03-28",price:70,fmts:["Parejas"],desc:"CrossGames en Almansa, Albacete.",feat:false,verified:false,ratings:[]},
  {id:28,name:"Open Gualas Training Club",disc:"CrossFit",city:"Badajoz",prov:"Badajoz",country:"España",date:"2026-03-21",price:0,fmts:["Individual"],desc:"Open CrossFit destacado en Badajoz.",feat:true,verified:false,ratings:[]},
  {id:29,name:"Crossdys Open 2026",disc:"CrossFit",city:"Huesca",prov:"Huesca",country:"España",date:"2026-03-18",price:0,fmts:["Individual"],desc:"Open CrossFit en Huesca.",feat:true,verified:false,ratings:[]},
  {id:30,name:"3 Test Niwala Hyrox",disc:"Hyrox",city:"Alicante",prov:"Alicante",country:"España",date:"2026-03-07",price:39,fmts:["Parejas"],desc:"Test Hyrox Niwala en Alicante.",feat:true,verified:false,ratings:[]},
  {id:31,name:"Mega Athlete Games",disc:"CrossFit",city:"Palma de Mallorca",prov:"Baleares",country:"España",date:"2026-03-07",price:0,fmts:["Parejas"],desc:"Atletas hibridos en Mallorca.",feat:true,verified:false,ratings:[]},
  {id:32,name:"BGP Battle V Edicion",disc:"CrossFit",city:"Las Palmas de GC",prov:"Las Palmas",country:"España",date:"2026-03-07",price:130,fmts:["Individual","Parejas"],desc:"Quinta edicion en Gran Canaria.",feat:true,verified:false,ratings:[]},
  {id:33,name:"FBOX Games IV",disc:"CrossFit",city:"Los Realejos",prov:"Tenerife",country:"España",date:"2026-02-07",price:50,fmts:["Individual"],desc:"FBOX Games en Tenerife.",feat:false,verified:false,ratings:[]},
  {id:34,name:"Elche Throwdown 2026",disc:"CrossFit",city:"Elche",prov:"Alicante",country:"España",date:"2026-02-07",price:110,fmts:["Parejas"],desc:"Throwdown de parejas en Elche.",feat:true,verified:false,ratings:[]},
  {id:35,name:"Elite Magma Games 2026",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2026-02-07",price:55,fmts:["Parejas"],desc:"Evento elite de parejas en Málaga.",feat:true,verified:false,ratings:[]},
  {id:36,name:"MADRIZ WAR OF PAIRS 2026",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-02-14",price:140,fmts:["Cuartetos"],desc:"War of Pairs 2026 en Madrid.",feat:true,verified:false,ratings:[]},
  {id:37,name:"Coin Fitness Games 2026",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2026-02-14",price:75,fmts:["Individual","Parejas"],desc:"Games en la provincia de Málaga.",feat:false,verified:false,ratings:[]},
  {id:38,name:"O2 Limit Challenge 2026",disc:"CrossFit",city:"Sierra Nevada",prov:"Granada",country:"España",date:"2026-07-10",price:82,fmts:["Individual"],desc:"Reto de altura en Sierra Nevada.",feat:true,verified:false,ratings:[]},
  {id:39,name:"Naiz Battle Running Final",disc:"CrossFit",city:"Labastida",prov:"Alava",country:"España",date:"2026-03-14",price:0,fmts:["Cuartetos"],desc:"Final del Naiz Battle Running en Alava.",feat:true,verified:false,ratings:[]},
  {id:40,name:"BEV Cup Ebro Box",disc:"CrossFit",city:"Tudela",prov:"Navarra",country:"España",date:"2026-03-14",price:90,fmts:["Trios"],desc:"Copa Ebro Box en Tudela, Navarra.",feat:true,verified:false,ratings:[]},
  {id:41,name:"Gladiators Arena Games 2025",disc:"CrossFit",city:"Pamplona",prov:"Navarra",country:"España",date:"2025-09-06",price:60,fmts:["Individual","Parejas"],desc:"Evento en el Pamplona Arena.",feat:true,verified:false,ratings:[]},
  {id:42,name:"Gijón Throwdown 2025",disc:"CrossFit",city:"Gijón",prov:"Asturias",country:"España",date:"2025-11-22",price:300,fmts:["Cuartetos"],desc:"Uno de los grandes del norte de España.",feat:true,verified:false,ratings:[]},
  {id:43,name:"Castellón Throwdown 2025",disc:"CrossFit",city:"Grau de Castellón",prov:"Castellón",country:"España",date:"2025-11-15",price:120,fmts:["Individual","Parejas"],desc:"Referente en la Comunitat Valenciana.",feat:true,verified:false,ratings:[]},
  {id:44,name:"Alicante Fitness Games 2025",disc:"CrossFit",city:"Salinas",prov:"Alicante",country:"España",date:"2025-11-08",price:135,fmts:["Individual","Parejas","Trios"],desc:"Gran evento con multiples categorias.",feat:true,verified:false,ratings:[]},
  {id:45,name:"Hispania Championships 2025",disc:"CrossFit",city:"Almodovar del Rio",prov:"Córdoba",country:"España",date:"2025-11-08",price:100,fmts:["Parejas"],desc:"Campeonato Hispania en Córdoba.",feat:true,verified:false,ratings:[]},
  {id:46,name:"La Rioja Arena Games 2025",disc:"CrossFit",city:"Logroño",prov:"La Rioja",country:"España",date:"2025-10-18",price:200,fmts:["Individual","Cuartetos","Equipos +4"],desc:"Games en el Arena de Logroño.",feat:true,verified:false,ratings:[]},
  {id:47,name:"Makumba Games IV 2025",disc:"CrossFit",city:"Murcia",prov:"Murcia",country:"España",date:"2025-10-18",price:195,fmts:["Parejas","Trios","Cuartetos"],desc:"Cuarta edicion de los Makumba Games.",feat:true,verified:false,ratings:[]},
  {id:48,name:"Antequera Throwdown 2025",disc:"CrossFit",city:"Antequera",prov:"Málaga",country:"España",date:"2025-10-17",price:153,fmts:["Parejas"],desc:"Throwdown en Antequera, Málaga.",feat:true,verified:false,ratings:[]},
  {id:49,name:"Superchallenge SJD",disc:"CrossFit",city:"Sant Feliu de Llobregat",prov:"Barcelona",country:"España",date:"2025-11-09",price:70,fmts:["Parejas"],desc:"Superchallenge en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:50,name:"Titan Games",disc:"CrossFit",city:"Alicante",prov:"Alicante",country:"España",date:"2025-11-22",price:50,fmts:["Parejas"],desc:"Titan Games en Alicante.",feat:true,verified:false,ratings:[]},
  {id:51,name:"Daurada Games 2025",disc:"CrossFit",city:"Cambrils",prov:"Tarragona",country:"España",date:"2025-08-30",price:290,fmts:["Parejas","Cuartetos"],desc:"Games de verano en Cambrils.",feat:true,verified:false,ratings:[]},
  {id:52,name:"Tropical Championship 2025",disc:"CrossFit",city:"Motril",prov:"Granada",country:"España",date:"2025-10-25",price:120,fmts:["Individual","Trios"],desc:"Campeonato tropical en Motril, Granada.",feat:true,verified:false,ratings:[]},
  {id:53,name:"Gran Canaria Challenge 2025",disc:"CrossFit",city:"Las Palmas de GC",prov:"Las Palmas",country:"España",date:"2025-10-11",price:105,fmts:["Individual","Parejas"],desc:"Challenge en Gran Canaria.",feat:true,verified:false,ratings:[]},
  {id:54,name:"Urraca Games 2025",disc:"CrossFit",city:"Zamora",prov:"Zamora",country:"España",date:"2025-09-12",price:250,fmts:["Individual","Parejas","Cuartetos"],desc:"Los Urraca Games en Zamora.",feat:true,verified:false,ratings:[]},
  {id:55,name:"The Jungle Throwdown 2025",disc:"CrossFit",city:"Salou",prov:"Tarragona",country:"España",date:"2025-09-27",price:270,fmts:["Trios"],desc:"Throwdown en Salou, Tarragona.",feat:true,verified:false,ratings:[]},
  {id:56,name:"Sol Games 2025",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2025-09-20",price:195,fmts:["Trios"],desc:"Sol Games en Sevilla.",feat:true,verified:false,ratings:[]},
  {id:57,name:"Granada Championship 2025",disc:"CrossFit",city:"Granada",prov:"Granada",country:"España",date:"2025-09-19",price:130,fmts:["Parejas"],desc:"Campeonato de Granada.",feat:true,verified:false,ratings:[]},
  {id:58,name:"CFT Challenge 2025",disc:"CrossFit",city:"Ibi",prov:"Alicante",country:"España",date:"2025-09-27",price:130,fmts:["Parejas"],desc:"Challenge en Ibi, Alicante.",feat:true,verified:false,ratings:[]},
  {id:59,name:"Gigia Games 2025",disc:"CrossFit",city:"Gijón",prov:"Asturias",country:"España",date:"2025-10-24",price:150,fmts:["Equipos +4"],desc:"Games en Gijón con equipos de 5.",feat:true,verified:false,ratings:[]},
  {id:60,name:"Black N White Challenge 2025",disc:"CrossFit",city:"Salamanca",prov:"Salamanca",country:"España",date:"2025-10-25",price:225,fmts:["Parejas","Trios"],desc:"Challenge en Salamanca.",feat:true,verified:false,ratings:[]},
  {id:61,name:"Bufalo Games 2025",disc:"CrossFit",city:"Granollers",prov:"Barcelona",country:"España",date:"2025-10-25",price:87,fmts:["Parejas"],desc:"Bufalo Games en Granollers.",feat:true,verified:false,ratings:[]},
  {id:62,name:"Balaguer Showdown 2025",disc:"CrossFit",city:"Balaguer",prov:"Lleida",country:"España",date:"2025-05-31",price:270,fmts:["Parejas","Cuartetos"],desc:"Showdown en Balaguer, Lleida.",feat:true,verified:false,ratings:[]},
  {id:63,name:"Valencia THROWDOWN 2025",disc:"CrossFit",city:"Valencia",prov:"Valencia",country:"España",date:"2025-05-23",price:85,fmts:["Individual","Parejas","Trios","Cuartetos"],desc:"El gran Throwdown de Valencia.",feat:true,verified:true,ratings:[]},
  {id:64,name:"La Batalla de Guisando 2025",disc:"CrossFit",city:"El Tiemblo",prov:"Ávila",country:"España",date:"2025-05-23",price:260,fmts:["Cuartetos"],desc:"Batalla de Guisando en Ávila.",feat:true,verified:false,ratings:[]},
  {id:65,name:"El Legado del Bisonte 2025",disc:"CrossFit",city:"Torrelavega",prov:"Cantabria",country:"España",date:"2025-06-13",price:195,fmts:["Individual","Cuartetos"],desc:"Legado del Bisonte en Torrelavega.",feat:true,verified:false,ratings:[]},
  {id:66,name:"Málaga Throwdown 2025",disc:"CrossFit",city:"Torremolinos",prov:"Málaga",country:"España",date:"2025-11-21",price:225,fmts:["Individual"],desc:"El gran Throwdown de Málaga.",feat:true,verified:false,ratings:[]},
  {id:67,name:"MADRIZ WAR OF PAIRS 2025",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2025-06-21",price:180,fmts:["Parejas"],desc:"War of Pairs en Madrid 2025.",feat:true,verified:false,ratings:[]},
  {id:68,name:"NorthFit Irun 2025",disc:"CrossFit",city:"Irun",prov:"Guipuzcoa",country:"España",date:"2025-05-24",price:200,fmts:["Parejas"],desc:"NorthFit en Irun, Guipuzcoa.",feat:true,verified:false,ratings:[]},
  {id:69,name:"Roca Throwdown 2025",disc:"CrossFit",city:"Palma de Mallorca",prov:"Baleares",country:"España",date:"2025-05-23",price:360,fmts:["Cuartetos"],desc:"El Roca Throwdown en Mallorca.",feat:true,verified:false,ratings:[]},
  {id:70,name:"The Battle of La Colmena 2025",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2025-05-24",price:200,fmts:["Cuartetos"],desc:"La Colmena Games en Sevilla.",feat:true,verified:false,ratings:[]},
  {id:71,name:"CFHK 2025",disc:"CrossFit",city:"Barakaldo",prov:"Bizkaia",country:"España",date:"2025-06-28",price:370,fmts:["Cuartetos"],desc:"CFHK en Barakaldo. El mas premium del norte.",feat:true,verified:false,ratings:[]},
  {id:72,name:"O2 Limit Challenge 2025",disc:"CrossFit",city:"Sierra Nevada",prov:"Granada",country:"España",date:"2025-07-04",price:160,fmts:["Individual","Cuartetos"],desc:"Competicion de altitud en Sierra Nevada.",feat:true,verified:false,ratings:[]},
  {id:73,name:"Tenerife Showdown 2025",disc:"CrossFit",city:"La Laguna",prov:"Tenerife",country:"España",date:"2025-07-26",price:280,fmts:["Trios"],desc:"Showdown en Tenerife.",feat:true,verified:false,ratings:[]},
  {id:74,name:"Royal Beach Games 2025",disc:"CrossFit",city:"Aguilas",prov:"Murcia",country:"España",date:"2025-07-12",price:240,fmts:["Parejas","Cuartetos"],desc:"Games en la playa de Aguilas.",feat:true,verified:false,ratings:[]},
  {id:75,name:"NAIZ Battle 2025",disc:"CrossFit",city:"Labastida",prov:"Alava",country:"España",date:"2025-08-23",price:180,fmts:["Cuartetos"],desc:"Naiz Battle en Labastida, Alava.",feat:true,verified:false,ratings:[]},
  {id:76,name:"The Picsil Showdown 2025",disc:"CrossFit",city:"Pamplona",prov:"Navarra",country:"España",date:"2025-02-07",price:200,fmts:["Individual","Cuartetos"],desc:"El Picsil Showdown en Navarra Arena.",feat:true,verified:true,ratings:[]},
  {id:77,name:"Hammer Throwdown 2025",disc:"CrossFit",city:"Guadarrama",prov:"Madrid",country:"España",date:"2025-07-12",price:105,fmts:["Parejas"],desc:"Throwdown en Guadarrama, Madrid.",feat:true,verified:false,ratings:[]},
  {id:78,name:"LAUCEB Games Winter 2025",disc:"CrossFit",city:"Argentona",prov:"Barcelona",country:"España",date:"2025-12-13",price:90,fmts:["Parejas"],desc:"Lauceb Games en Argentona.",feat:true,verified:false,ratings:[]},
  {id:79,name:"Por Ellas Throwdown 2025",disc:"CrossFit",city:"Pineda del Mar",prov:"Barcelona",country:"España",date:"2025-11-22",price:70,fmts:["Trios"],desc:"Throwdown solidario femenino en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:80,name:"Barbatyr Games 2025",disc:"CrossFit",city:"Pedrera",prov:"Sevilla",country:"España",date:"2025-08-29",price:114,fmts:["Parejas"],desc:"Barbatyr Games en Pedrera, Sevilla.",feat:true,verified:false,ratings:[]},
  {id:101,name:"EXPERIENCE II CrossGames",disc:"CrossFit",city:"Almansa",prov:"Albacete",country:"España",date:"2026-03-28",price:70,fmts:["Parejas"],desc:"CrossGames Experience II en Almansa, Albacete.",feat:false,verified:false,ratings:[]},
  {id:102,name:"Hibrid-Bou",disc:"Fitness Funcional",city:"Valls",prov:"Tarragona",country:"España",date:"2026-03-28",price:10,fmts:["Parejas"],desc:"Evento hibrido en Valls, Tarragona.",feat:false,verified:false,ratings:[]},
  {id:103,name:"Duo Challenge No Pain No Rest",disc:"Fitness Funcional",city:"Altea",prov:"Alicante",country:"España",date:"2026-03-28",price:0,fmts:["Parejas"],desc:"Duo challenge presencial en Altea, Alicante.",feat:false,verified:false,ratings:[]},
  {id:104,name:"BALAGUER SHOWDOWN 2026",disc:"CrossFit",city:"Balaguer",prov:"Lleida",country:"España",date:"2026-06-13",price:315,fmts:["Parejas","Cuartetos"],desc:"Showdown en Balaguer, Lleida. Edicion 2026.",feat:true,verified:false,ratings:[]},
  {id:105,name:"El Legado del Bisonte 2026",disc:"CrossFit",city:"Torrelavega",prov:"Cantabria",country:"España",date:"2026-06-12",price:439,fmts:["Cuartetos"],desc:"Legado del Bisonte 2026 en Torrelavega, Cantabria.",feat:true,verified:false,ratings:[]},
  {id:106,name:"TARONJA BOX GAMES",disc:"CrossFit",city:"Moncada",prov:"Valencia",country:"España",date:"2026-04-11",price:60,fmts:["Cuartetos"],desc:"Taronja Box Games en Moncada, Valencia.",feat:true,verified:false,ratings:[]},
  {id:107,name:"Fitness Race",disc:"Fitness Funcional",city:"San Martin de la Vega",prov:"Madrid",country:"España",date:"2026-04-11",price:40,fmts:["Parejas"],desc:"Fitness Race en San Martin de la Vega, Madrid.",feat:false,verified:false,ratings:[]},
  {id:108,name:"Level Wod Volcanic Games 7.0",disc:"CrossFit",city:"Sant Joan les Fonts",prov:"Girona",country:"España",date:"2026-06-06",price:90,fmts:["Parejas"],desc:"Volcanic Games 7.0 en Sant Joan les Fonts, Girona.",feat:true,verified:false,ratings:[]},
  {id:109,name:"2 Aniversario PRIME",disc:"CrossFit",city:"Alcorcón",prov:"Madrid",country:"España",date:"2026-04-11",price:25,fmts:["Parejas"],desc:"2o Aniversario Prime en Alcorcón, Madrid.",feat:false,verified:false,ratings:[]},
  {id:110,name:"TEST HYROX SPRINT DOUBLES",disc:"Hyrox",city:"Madrid",prov:"Madrid",country:"España",date:"2026-04-11",price:25,fmts:["Parejas"],desc:"Test Hyrox Sprint Doubles en Madrid.",feat:false,verified:false,ratings:[]},
  {id:111,name:"Unbroken Hybrid Games",disc:"Fitness Funcional",city:"Les Franqueses del Valles",prov:"Barcelona",country:"España",date:"2026-04-11",price:90,fmts:["Parejas"],desc:"Unbroken Hybrid Games en Les Franqueses del Valles, Barcelona.",feat:true,verified:false,ratings:[]},
  {id:112,name:"VITORIA ARENA GAMES 26",disc:"CrossFit",city:"Vitoria",prov:"Alava",country:"España",date:"2026-04-18",price:420,fmts:["Cuartetos"],desc:"Vitoria Arena Games 2026 en Vitoria, Pais Vasco.",feat:true,verified:false,ratings:[]},
  {id:113,name:"REPBYREP II EDITION",disc:"Fitness Funcional",city:"Sabadell",prov:"Barcelona",country:"España",date:"2026-04-25",price:100,fmts:["Parejas"],desc:"RepByRep II Edition en Sabadell, Barcelona.",feat:true,verified:false,ratings:[]},
  {id:114,name:"ATENEA HYBRID RACE",disc:"Fitness Funcional",city:"Girona",prov:"Girona",country:"España",date:"2026-04-18",price:120,fmts:["Parejas"],desc:"Atenea Hybrid Race en Girona.",feat:true,verified:false,ratings:[]},
  {id:115,name:"TheGarage Games 2026",disc:"CrossFit",city:"Tarrega",prov:"Lleida",country:"España",date:"2026-04-18",price:0,fmts:["Parejas"],desc:"TheGarage Games 2026 en Tarrega, Lleida.",feat:false,verified:false,ratings:[]},
  {id:116,name:"JUMANJI THROWDOWN 2",disc:"CrossFit",city:"Roquetas de Mar",prov:"Almería",country:"España",date:"2026-04-17",price:150,fmts:["Individual","Parejas","Trios"],desc:"Jumanji Throwdown 2 en Roquetas de Mar, Almería.",feat:true,verified:false,ratings:[]},
  {id:117,name:"Hybrid Race Evolution 4 Edicion",disc:"Fitness Funcional",city:"Ibi",prov:"Alicante",country:"España",date:"2026-04-25",price:50,fmts:["Individual","Parejas"],desc:"Hybrid Race Evolution 4a Edicion en Ibi, Alicante.",feat:true,verified:false,ratings:[]},
  {id:118,name:"OWL JAM VI",disc:"CrossFit",city:"Móstoles",prov:"Madrid",country:"España",date:"2026-04-25",price:255,fmts:["Trios"],desc:"OWL JAM VI en Móstoles, Madrid.",feat:true,verified:false,ratings:[]},
  {id:119,name:"NorthFit Hybrid HK Eibar",disc:"Fitness Funcional",city:"Eibar",prov:"Guipuzcoa",country:"España",date:"2026-04-25",price:150,fmts:["Parejas","Trios"],desc:"NorthFit Hybrid HK en Eibar, Guipuzcoa.",feat:true,verified:false,ratings:[]},
  {id:120,name:"NORTHFIT IRUN 2026",disc:"CrossFit",city:"Irun",prov:"Guipuzcoa",country:"España",date:"2026-05-23",price:200,fmts:["Parejas"],desc:"NorthFit Irun 2026 en Irun, Guipuzcoa.",feat:true,verified:false,ratings:[]},
  {id:121,name:"Villanueva Throwdown 2026",disc:"CrossFit",city:"Villanueva de la Canada",prov:"Madrid",country:"España",date:"2026-06-20",price:140,fmts:["Parejas"],desc:"Villanueva Throwdown 2026 en Villanueva de la Canada, Madrid.",feat:true,verified:false,ratings:[]},
  {id:122,name:"IBI STRENGTH SHOWDOWN 2026",disc:"Fuerza",city:"Ibi",prov:"Alicante",country:"España",date:"2026-06-13",price:130,fmts:["Parejas"],desc:"Ibi Strength Showdown 2026 en Ibi, Alicante.",feat:true,verified:false,ratings:[]},
  {id:123,name:"Vera Summer Showdown Equipos",disc:"CrossFit",city:"Vera",prov:"Almería",country:"España",date:"2026-05-23",price:150,fmts:["Parejas"],desc:"Vera Summer Showdown edicion equipos en Vera, Almería.",feat:false,verified:false,ratings:[]},
  {id:124,name:"Ronda Battle Series XXVI",disc:"CrossFit",city:"Ronda",prov:"Málaga",country:"España",date:"2026-06-19",price:246,fmts:["Trios"],desc:"Ronda Battle Series XXVI en Ronda, Málaga.",feat:true,verified:false,ratings:[]},
  {id:125,name:"Sol Games 26",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-05-30",price:120,fmts:["Cuartetos"],desc:"Sol Games 2026 en Sevilla.",feat:true,verified:false,ratings:[]},
  {id:126,name:"GIGIA GAMES 2026",disc:"CrossFit",city:"Gijón",prov:"Asturias",country:"España",date:"2026-05-15",price:180,fmts:["Cuartetos"],desc:"Gigia Games 2026 en Gijón, Asturias.",feat:true,verified:false,ratings:[]},
  {id:127,name:"II EDICION ALCAZABA THROWDOWN",disc:"CrossFit",city:"Casares",prov:"Málaga",country:"España",date:"2026-05-02",price:90,fmts:["Parejas"],desc:"Alcazaba Throwdown 2a edicion en Casares, Málaga.",feat:true,verified:false,ratings:[]},
  {id:128,name:"NIWALA NIGHT EXPERIENCE",disc:"Fitness Funcional",city:"Alicante",prov:"Alicante",country:"España",date:"2026-05-30",price:67,fmts:["Parejas"],desc:"Niwala Night Experience en Alicante.",feat:false,verified:false,ratings:[]},
  {id:129,name:"ELITE FUNCTIONAL CHALLENGER TORROX 2026",disc:"Fitness Funcional",city:"Torrox",prov:"Málaga",country:"España",date:"2026-04-30",price:200,fmts:["Individual"],desc:"Elite Functional Challenger en Torrox, Málaga.",feat:true,verified:false,ratings:[]},
  {id:130,name:"Desafio Marae 2026",disc:"Fitness Funcional",city:"La Herradura",prov:"Granada",country:"España",date:"2026-05-23",price:150,fmts:["Parejas"],desc:"Desafio Marae 2026 en La Herradura, Granada.",feat:true,verified:false,ratings:[]},
  {id:131,name:"FUERTEVENTURA LA BREGA",disc:"CrossFit",city:"Tuineje",prov:"Las Palmas",country:"España",date:"2026-06-19",price:97,fmts:["Individual","Parejas"],desc:"Fuerteventura La Brega en Tuineje, Fuerteventura.",feat:true,verified:false,ratings:[]},
  {id:132,name:"Rota Championship II",disc:"CrossFit",city:"Rota",prov:"Cádiz",country:"España",date:"2026-06-27",price:90,fmts:["Parejas"],desc:"Rota Championship II en Rota, Cádiz.",feat:true,verified:false,ratings:[]},
  {id:133,name:"SOMA THROWDOWN",disc:"CrossFit",city:"Valencia",prov:"Valencia",country:"España",date:"2026-05-10",price:180,fmts:["Cuartetos"],desc:"SOMA Throwdown en Valencia.",feat:true,verified:false,ratings:[]},
  {id:134,name:"CROSSHYBRID THROWDOWN PAMPLONA",disc:"Fitness Funcional",city:"Orkoien",prov:"Navarra",country:"España",date:"2026-05-30",price:90,fmts:["Parejas"],desc:"Crosshybrid Throwdown en Orkoien, Navarra.",feat:true,verified:false,ratings:[]},
  {id:135,name:"ZOMA BEAST GAMES",disc:"CrossFit",city:"Alzira",prov:"Valencia",country:"España",date:"2026-05-09",price:90,fmts:["Parejas"],desc:"Zoma Beast Games en Alzira, Valencia.",feat:true,verified:false,ratings:[]},
  {id:136,name:"MOLIS LEGEND 2026",disc:"CrossFit",city:"Mos",prov:"Pontevedra",country:"España",date:"2026-05-01",price:115,fmts:["Individual","Parejas"],desc:"Molis Legend 2026 en Mos, Pontevedra.",feat:true,verified:false,ratings:[]},
  {id:137,name:"Estepona Games",disc:"CrossFit",city:"Estepona",prov:"Málaga",country:"España",date:"2026-06-26",price:160,fmts:["Parejas"],desc:"Estepona Games en Estepona, Málaga.",feat:true,verified:false,ratings:[]},
  {id:138,name:"Crossbox Owl Look Strong Race",disc:"Fuerza",city:"Murcia",prov:"Murcia",country:"España",date:"2026-05-23",price:120,fmts:["Trios"],desc:"Crossbox Owl Look Strong Race en Murcia.",feat:false,verified:false,ratings:[]},
  {id:139,name:"Tomelloso Throwdown 2026",disc:"CrossFit",city:"Tomelloso",prov:"Ciudad Real",country:"España",date:"2026-05-09",price:100,fmts:["Individual","Parejas"],desc:"Tomelloso Throwdown 2026 en Tomelloso, Ciudad Real.",feat:false,verified:false,ratings:[]},
  {id:140,name:"Mudland Games Villafranca 2026",disc:"Fitness Funcional",city:"Villafranca de los Barros",prov:"Badajoz",country:"España",date:"2026-05-23",price:120,fmts:["Parejas"],desc:"Mudland Games en Villafranca de los Barros, Badajoz.",feat:true,verified:false,ratings:[]},
  {id:141,name:"Hybrid Arena Membrilla 2026",disc:"Fitness Funcional",city:"Membrilla",prov:"Ciudad Real",country:"España",date:"2026-05-31",price:60,fmts:["Individual","Parejas"],desc:"Hybrid Arena Membrilla 2026 en Ciudad Real.",feat:true,verified:false,ratings:[]},
  {id:142,name:"Sacaba Summer Games 2026",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2026-06-06",price:185,fmts:["Parejas"],desc:"Sacaba Summer Games 2026 en Málaga.",feat:true,verified:false,ratings:[]},
  {id:143,name:"DAURADA GAMES + HYBRID RACE 2026",disc:"Fitness Funcional",city:"Tarragona",prov:"Tarragona",country:"España",date:"2026-06-27",price:240,fmts:["Parejas","Cuartetos"],desc:"Daurada Games + Hybrid Race 2026.",feat:true,verified:false,ratings:[]},
  {id:144,name:"VALENCIA THROWDOWN 2026",disc:"CrossFit",city:"Valencia",prov:"Valencia",country:"España",date:"2026-05-22",price:190,fmts:["Individual","Trios","Cuartetos"],desc:"Valencia Throwdown 2026 edicion principal.",feat:true,verified:false,ratings:[]},
  {id:145,name:"Vera Summer Showdown Ind 2026",disc:"CrossFit",city:"Vera",prov:"Almería",country:"España",date:"2026-05-23",price:75,fmts:["Individual"],desc:"Vera Summer Showdown Individual 2026 en Vera, Almería.",feat:false,verified:false,ratings:[]},
  {id:146,name:"SPARK GAMES",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-05-16",price:60,fmts:["Parejas"],desc:"Spark Games en Sevilla.",feat:true,verified:false,ratings:[]},
  {id:147,name:"SEVILLA THROWDOWN INDIVIDUAL 2026",disc:"CrossFit",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-04-11",price:60,fmts:["Individual"],desc:"Sevilla Throwdown Individual 2026.",feat:true,verified:false,ratings:[]},
  {id:148,name:"Flamingo Invitational 2026",disc:"CrossFit",city:"San Javier",prov:"Murcia",country:"España",date:"2026-04-11",price:150,fmts:["Parejas","Trios"],desc:"Flamingo Invitacional 2026 en San Javier, Murcia.",feat:true,verified:false,ratings:[]},
  {id:149,name:"Healthy & Fit Games 2026",disc:"CrossFit",city:"Vilamarxant",prov:"Valencia",country:"España",date:"2026-04-11",price:120,fmts:["Individual","Parejas"],desc:"Healthy & Fit Games 2026 en Vilamarxant, Valencia.",feat:true,verified:false,ratings:[]},
  {id:150,name:"LANZAROTE SUMMER CHALLENGE 2026",disc:"CrossFit",city:"Arrecife",prov:"Las Palmas",country:"España",date:"2026-07-11",price:120,fmts:["Parejas"],desc:"Lanzarote Summer Challenge 2026 en Arrecife, Lanzarote.",feat:true,verified:false,ratings:[]},
  {id:151,name:"BRAVE CHALLENGE HYBRID II",disc:"Fitness Funcional",city:"Blanes",prov:"Girona",country:"España",date:"2026-05-09",price:50,fmts:["Parejas"],desc:"Brave Challenge Hybrid II en Blanes, Girona.",feat:true,verified:false,ratings:[]},
  {id:152,name:"AREA UNITED HYBRID FESTIVAL",disc:"Fitness Funcional",city:"Viladecans",prov:"Barcelona",country:"España",date:"2026-10-03",price:90,fmts:["Parejas","Cuartetos"],desc:"Area United Hybrid Festival Strongman Edition en Viladecans, Barcelona.",feat:true,verified:false,ratings:[]},
  {id:153,name:"APEX HYBRID CHALLENGE",disc:"Fitness Funcional",city:"Sevilla",prov:"Sevilla",country:"España",date:"2026-05-09",price:90,fmts:["Parejas"],desc:"Apex Hybrid Challenge en Sevilla.",feat:true,verified:false,ratings:[]},
  {id:154,name:"PartnerXot 26",disc:"CrossFit",city:"Palma de Mallorca",prov:"Baleares",country:"España",date:"2026-05-23",price:140,fmts:["Cuartetos"],desc:"PartnerXot 2026 en Baleares.",feat:true,verified:false,ratings:[]},
  {id:155,name:"Promofit Games XX",disc:"CrossFit",city:"Porto",prov:"Portugal",country:"Portugal",date:"2026-06-05",price:218,fmts:["Individual","Equipos +4"],desc:"Promofit Games XX en Porto, Portugal.",feat:true,verified:false,ratings:[]},
  {id:156,name:"PHOENIX ON THE BEACH 2K26",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2026-06-13",price:115,fmts:["Individual","Parejas"],desc:"Phoenix On The Beach 2026.",feat:true,verified:false,ratings:[]},
  {id:157,name:"NEREO GAMES 2026",disc:"CrossFit",city:"Palau d'Anglesola",prov:"Lleida",country:"España",date:"2026-05-30",price:195,fmts:["Trios"],desc:"Nereo Games 2026 en Palau d'Anglesola, Lleida.",feat:true,verified:false,ratings:[]},
  {id:158,name:"THE FITTEST BOX 2026",disc:"CrossFit",city:"Granada",prov:"Granada",country:"España",date:"2026-05-30",price:185,fmts:["Trios"],desc:"The Fittest Box 2026 en Granada.",feat:true,verified:false,ratings:[]},
  {id:159,name:"La Batalla de Acero 2026 La Palma",disc:"CrossFit",city:"Los Llanos de Aridane",prov:"Tenerife",country:"España",date:"2026-06-27",price:210,fmts:["Trios"],desc:"La Batalla de Acero 2026 en La Palma.",feat:true,verified:false,ratings:[]},
  {id:160,name:"SALAMANCA GAMES 2026",disc:"CrossFit",city:"Salamanca",prov:"Salamanca",country:"España",date:"2026-06-27",price:380,fmts:["Cuartetos"],desc:"Salamanca Games 2026.",feat:true,verified:false,ratings:[]},
  {id:161,name:"ATENEA GAMES",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-20",price:200,fmts:["Cuartetos"],desc:"Atenea Games 2026 en Madrid.",feat:true,verified:false,ratings:[]},
  {id:162,name:"CARTHAGO GAMES",disc:"CrossFit",city:"Cartagena",prov:"Murcia",country:"España",date:"2026-06-13",price:145,fmts:["Parejas"],desc:"Carthago Games en Cartagena, Murcia.",feat:true,verified:false,ratings:[]},
  {id:163,name:"GRANADA HUMANITY WODS",disc:"CrossFit",city:"Granada",prov:"Granada",country:"España",date:"2026-06-13",price:270,fmts:["Cuartetos","Equipos +4"],desc:"Granada Humanity Wods en Granada.",feat:true,verified:false,ratings:[]},
  {id:164,name:"GANESHAGAMES",disc:"CrossFit",city:"Marratxi",prov:"Baleares",country:"España",date:"2026-06-06",price:245,fmts:["Parejas","Trios"],desc:"Ganesha Games en Marratxi, Baleares.",feat:true,verified:false,ratings:[]},
  {id:165,name:"ABLITAS TEAMS BATTLE 2026",disc:"CrossFit",city:"Ablitas",prov:"Navarra",country:"España",date:"2026-06-06",price:400,fmts:["Cuartetos"],desc:"Ablitas Teams Battle 2026 en Ablitas, Navarra.",feat:true,verified:false,ratings:[]},
  {id:166,name:"BSNT Hybrid",disc:"Fitness Funcional",city:"Torrelavega",prov:"Cantabria",country:"España",date:"2026-06-13",price:65,fmts:["Parejas"],desc:"BSNT Hybrid en Torrelavega, Cantabria.",feat:false,verified:false,ratings:[]},
  {id:167,name:"The Jungle Throwdown 26",disc:"CrossFit",city:"Salou",prov:"Tarragona",country:"España",date:"2026-09-26",price:280,fmts:["Trios"],desc:"The Jungle Throwdown 2026 en Salou, Tarragona.",feat:true,verified:false,ratings:[]},
  {id:168,name:"Royal Beach Games IV",disc:"CrossFit",city:"Aguilas",prov:"Murcia",country:"España",date:"2026-07-18",price:200,fmts:["Parejas","Trios"],desc:"Royal Beach Games IV edicion en Aguilas, Murcia.",feat:true,verified:false,ratings:[]},
  {id:169,name:"THE LAUCEB GAMES SUMMER EDITION",disc:"CrossFit",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-06-27",price:150,fmts:["Trios"],desc:"Lauceb Games Summer Edition en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:170,name:"Consuegra Throwdown 2026",disc:"CrossFit",city:"Toledo",prov:"Toledo",country:"España",date:"2026-06-20",price:300,fmts:["Parejas"],desc:"Consuegra Throwdown 2026 en Toledo.",feat:true,verified:false,ratings:[]},
  {id:171,name:"Vitality Games 2026",disc:"CrossFit",city:"Móstoles",prov:"Madrid",country:"España",date:"2026-09-26",price:131,fmts:["Parejas"],desc:"Vitality Games 2026 en Móstoles, Madrid.",feat:false,verified:false,ratings:[]},
  {id:172,name:"Elvas Cup 2026",disc:"CrossFit",city:"Elvas",prov:"Portugal",country:"Portugal",date:"2026-06-13",price:390,fmts:["Cuartetos"],desc:"Elvas Cup 2026 en Elvas, Portugal.",feat:true,verified:false,ratings:[]},
  {id:173,name:"Gaia Throwdown 2026",disc:"CrossFit",city:"Vila Nova de Gaia",prov:"Portugal",country:"Portugal",date:"2026-07-11",price:40,fmts:["Individual","Trios"],desc:"Gaia Throwdown 2026 en Vila Nova de Gaia, Portugal.",feat:true,verified:false,ratings:[]},
  {id:174,name:"HASKTRAINING GAMES 2026",disc:"CrossFit",city:"Molina de Segura",prov:"Murcia",country:"España",date:"2026-09-05",price:120,fmts:["Cuartetos"],desc:"HaskTraining Games 2026 en Molina de Segura, Murcia.",feat:true,verified:false,ratings:[]},
  {id:175,name:"Henko Hybrid Festival 2026",disc:"Fitness Funcional",city:"Amposta",prov:"Tarragona",country:"España",date:"2026-10-03",price:115,fmts:["Parejas"],desc:"Henko Hybrid Festival 2026 en Amposta, Tarragona.",feat:true,verified:false,ratings:[]},
  {id:176,name:"GARES THROWDOWN",disc:"CrossFit",city:"Puente la Reina",prov:"Navarra",country:"España",date:"2026-10-10",price:392,fmts:["Cuartetos"],desc:"Gares Throwdown en Puente la Reina, Navarra.",feat:true,verified:false,ratings:[]},
  {id:177,name:"TROPICAL CHAMPIONSHIP 2026",disc:"CrossFit",city:"Motril",prov:"Granada",country:"España",date:"2026-10-31",price:206,fmts:["Parejas","Trios"],desc:"Tropical Championship 2026 en Motril, Granada.",feat:true,verified:false,ratings:[]},
  {id:178,name:"HRX ALICANTE HYROX TEST SEPT 2026",disc:"Hyrox",city:"Alicante",prov:"Alicante",country:"España",date:"2026-09-19",price:79,fmts:["Individual","Parejas","Cuartetos"],desc:"HRX Alicante Hyrox Test septiembre 2026.",feat:true,verified:false,ratings:[]},
  {id:179,name:"Alicante Fitness Games 2026",disc:"CrossFit",city:"Sax",prov:"Alicante",country:"España",date:"2026-10-03",price:165,fmts:["Parejas","Trios"],desc:"Alicante Fitness Games 2026 en Sax, Alicante.",feat:true,verified:false,ratings:[]},
  {id:180,name:"CASTILLA THROWDOWN 2026",disc:"CrossFit",city:"Valladolid",prov:"Valladolid",country:"España",date:"2026-09-19",price:195,fmts:["Parejas"],desc:"Castilla Throwdown 2026 en Valladolid.",feat:true,verified:false,ratings:[]},
  {id:181,name:"Almansa CrossGames II",disc:"CrossFit",city:"Almansa",prov:"Albacete",country:"España",date:"2026-09-19",price:150,fmts:["Parejas"],desc:"Almansa CrossGames II edicion en Albacete.",feat:true,verified:false,ratings:[]},
  {id:182,name:"Meteor Games 2026",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2026-10-03",price:217,fmts:["Trios"],desc:"Meteor Games 2026 en Madrid.",feat:true,verified:false,ratings:[]},
  {id:183,name:"ANTEQUERA THROWDOWN 2026",disc:"CrossFit",city:"Antequera",prov:"Málaga",country:"España",date:"2026-10-24",price:171,fmts:["Individual","Parejas"],desc:"Antequera Throwdown 2026 en Antequera, Málaga.",feat:true,verified:false,ratings:[]},
  {id:184,name:"GRANADA CHAMPIONSHIP 2026",disc:"CrossFit",city:"Granada",prov:"Granada",country:"España",date:"2026-09-25",price:150,fmts:["Parejas"],desc:"Granada Championship 2026 en Granada.",feat:true,verified:false,ratings:[]},
  {id:185,name:"BARBATYR GAMES 2026",disc:"CrossFit",city:"Estepa",prov:"Sevilla",country:"España",date:"2026-10-09",price:110,fmts:["Parejas"],desc:"Barbatyr Games 2026 en Estepa, Sevilla.",feat:true,verified:false,ratings:[]},
  {id:186,name:"Flowrace",disc:"OCR",city:"Aguilas",prov:"Murcia",country:"España",date:"2026-10-24",price:67,fmts:["Individual","Parejas"],desc:"Flowrace en Aguilas, Murcia.",feat:true,verified:false,ratings:[]},
  {id:187,name:"WOD GAMES LA CARLOTA 2026",disc:"CrossFit",city:"La Carlota",prov:"Córdoba",country:"España",date:"2026-11-14",price:100,fmts:["Parejas"],desc:"Wod Games La Carlota 2026 en Córdoba.",feat:true,verified:false,ratings:[]},
  {id:188,name:"BASQUE CROSSFIT TXAPELKETA V",disc:"CrossFit",city:"Bilbao",prov:"Bizkaia",country:"España",date:"2026-10-30",price:335,fmts:["Parejas","Cuartetos"],desc:"Basque CrossFit Txapelketa V edicion en Bizkaia.",feat:true,verified:false,ratings:[]},
  {id:189,name:"PAMPLONA ARENA GAMES 26",disc:"CrossFit",city:"Pamplona",prov:"Navarra",country:"España",date:"2026-11-14",price:440,fmts:["Cuartetos"],desc:"Pamplona Arena Games 2026 en Pamplona.",feat:true,verified:false,ratings:[]},
  {id:190,name:"Makumba Games 5",disc:"CrossFit",city:"Murcia",prov:"Murcia",country:"España",date:"2026-10-17",price:175,fmts:["Individual","Parejas","Trios"],desc:"Makumba Games 5a edicion en Murcia.",feat:true,verified:false,ratings:[]},
  {id:191,name:"GIBRALTAR FITNESS GAMES",disc:"CrossFit",city:"Gibraltar",prov:"Gibraltar",country:"Gibraltar",date:"2026-10-24",price:140,fmts:["Parejas"],desc:"Gibraltar Fitness Games en Gibraltar.",feat:true,verified:false,ratings:[]},
  {id:192,name:"North Ox Trials",disc:"Fitness Funcional",city:"Oviedo",prov:"Asturias",country:"España",date:"2026-09-11",price:100,fmts:["Parejas"],desc:"North Ox Trials en Oviedo, Asturias.",feat:false,verified:false,ratings:[]},
  {id:193,name:"VTD27",disc:"CrossFit",city:"Valencia",prov:"Valencia",country:"España",date:"2027-03-12",price:275,fmts:["Parejas","Cuartetos"],desc:"Valencia Throwdown 2027 - ya abierto el registro.",feat:true,verified:false,ratings:[]},
  {id:200,name:"Road to Athens Throwdown 2025",disc:"CrossFit",city:"Murcia",prov:"Murcia",country:"España",date:"2025-03-15",price:60,fmts:["Individual","Trios"],desc:"Road to Athens Throwdown en Murcia.",feat:true,verified:false,ratings:[]},
  {id:201,name:"February Challenge León 2025",disc:"CrossFit",city:"León",prov:"León",country:"España",date:"2025-01-31",price:299,fmts:["Trios","Equipos +4"],desc:"February Challenge León Edition 2025.",feat:true,verified:false,ratings:[]},
  {id:202,name:"Castilla Throwdown 2025",disc:"CrossFit",city:"Valladolid",prov:"Valladolid",country:"España",date:"2025-03-15",price:175,fmts:["Parejas"],desc:"Castilla Throwdown 2025 en Valladolid.",feat:true,verified:false,ratings:[]},
  {id:203,name:"The Battle Games 2025",disc:"CrossFit",city:"Castellón",prov:"Castellón",country:"España",date:"2025-04-04",price:193,fmts:["Individual","Parejas","Trios"],desc:"The Battle Games 25 en Castellón.",feat:true,verified:false,ratings:[]},
  {id:204,name:"Flamingo Invitational 2025",disc:"CrossFit",city:"Los Alcazares",prov:"Murcia",country:"España",date:"2025-04-12",price:75,fmts:["Individual","Parejas"],desc:"Flamingo Invitational 2025 en Los Alcazares, Murcia.",feat:true,verified:false,ratings:[]},
  {id:205,name:"MOLIS LEGEND 2025",disc:"CrossFit",city:"Mos",prov:"Pontevedra",country:"España",date:"2025-04-12",price:115,fmts:["Individual","Parejas"],desc:"Molis Legend 2025 en Mos, Pontevedra.",feat:true,verified:false,ratings:[]},
  {id:206,name:"THE FITTEST BOX 2025",disc:"CrossFit",city:"Cullar Vega",prov:"Granada",country:"España",date:"2025-04-12",price:180,fmts:["Trios"],desc:"The Fittest Box 2025 en Cullar Vega, Granada.",feat:true,verified:false,ratings:[]},
  {id:207,name:"OWL JAM 5",disc:"CrossFit",city:"Móstoles",prov:"Madrid",country:"España",date:"2025-04-05",price:90,fmts:["Trios"],desc:"OWL JAM 5 en Móstoles, Madrid.",feat:true,verified:false,ratings:[]},
  {id:208,name:"The Team Games 2025",disc:"CrossFit",city:"Dolores",prov:"Alicante",country:"España",date:"2025-03-08",price:200,fmts:["Parejas","Trios"],desc:"The Team Games 2025 en Dolores, Alicante.",feat:true,verified:false,ratings:[]},
  {id:209,name:"ADIDAS CIERZO FC 2025",disc:"CrossFit",city:"Zaragoza",prov:"Zaragoza",country:"España",date:"2025-03-28",price:222,fmts:["Individual","Trios"],desc:"Adidas Cierzo Fitness Circuit 2025 en Zaragoza.",feat:true,verified:false,ratings:[]},
  {id:210,name:"WILD GAMES 25",disc:"CrossFit",city:"Canals",prov:"Valencia",country:"España",date:"2025-05-02",price:148,fmts:["Individual","Parejas"],desc:"Wild Games 25 en Canals, Valencia.",feat:true,verified:false,ratings:[]},
  {id:211,name:"Pacific Games 2025",disc:"CrossFit",city:"Pilar de la Horadada",prov:"Alicante",country:"España",date:"2025-05-03",price:45,fmts:["Individual","Parejas"],desc:"Pacific Games 2025 en Pilar de la Horadada, Alicante.",feat:false,verified:false,ratings:[]},
  {id:212,name:"Desafio Marae 2025",disc:"Fitness Funcional",city:"La Herradura",prov:"Granada",country:"España",date:"2025-05-24",price:140,fmts:["Parejas"],desc:"Desafio Marae 2025 en La Herradura, Granada.",feat:true,verified:false,ratings:[]},
  {id:213,name:"Tomelloso Throwdown 2025",disc:"CrossFit",city:"Tomelloso",prov:"Ciudad Real",country:"España",date:"2025-05-10",price:125,fmts:["Individual","Parejas"],desc:"Tomelloso Throwdown 2025 en Ciudad Real.",feat:false,verified:false,ratings:[]},
  {id:214,name:"NEREO GAMES 2025",disc:"CrossFit",city:"Palau d'Anglesola",prov:"Lleida",country:"España",date:"2025-05-17",price:180,fmts:["Trios"],desc:"Nereo Games 2025 en Palau d'Anglesola, Lleida.",feat:true,verified:false,ratings:[]},
  {id:215,name:"ABLITAS TEAMS BATTLE 2025",disc:"CrossFit",city:"Ablitas",prov:"Navarra",country:"España",date:"2025-06-06",price:400,fmts:["Cuartetos"],desc:"Ablitas Teams Battle 2025 en Ablitas, Navarra.",feat:true,verified:false,ratings:[]},
  {id:216,name:"Vera Summer Showdown 2025",disc:"CrossFit",city:"Vera",prov:"Almería",country:"España",date:"2025-05-31",price:130,fmts:["Parejas"],desc:"Vera Summer Showdown 2025 en Vera, Almería.",feat:false,verified:false,ratings:[]},
  {id:217,name:"SACABA SUMMER GAMES 2025",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2025-05-31",price:190,fmts:["Parejas"],desc:"Sacaba Summer Games 2025 en Málaga.",feat:true,verified:false,ratings:[]},
  {id:218,name:"Level Wod Volcanic Games 6",disc:"CrossFit",city:"La Canya",prov:"Girona",country:"España",date:"2025-05-31",price:75,fmts:["Parejas"],desc:"Level Wod Volcanic Games 6 en La Canya, Girona.",feat:true,verified:false,ratings:[]},
  {id:219,name:"Taronja Summer Fest 2025",disc:"CrossFit",city:"Valencia",prov:"Valencia",country:"España",date:"2025-06-07",price:132,fmts:["Individual","Parejas","Cuartetos"],desc:"Taronja Summer Fest 2025 en Valencia.",feat:true,verified:false,ratings:[]},
  {id:220,name:"IBI Strength Showdown 2025",disc:"Fuerza",city:"Ibi",prov:"Alicante",country:"España",date:"2025-06-14",price:110,fmts:["Parejas"],desc:"IBI Strength Showdown 2a edicion en Ibi, Alicante.",feat:true,verified:false,ratings:[]},
  {id:221,name:"ATENEA GAMES 2025",disc:"CrossFit",city:"L'Escala",prov:"Girona",country:"España",date:"2025-06-21",price:180,fmts:["Cuartetos"],desc:"Atenea Games 2025 en L'Escala, Girona.",feat:true,verified:false,ratings:[]},
  {id:222,name:"The Lauceb Games Summer 2025",disc:"CrossFit",city:"Sant Vicenc de Montalt",prov:"Barcelona",country:"España",date:"2025-06-14",price:210,fmts:["Trios"],desc:"The Lauceb Games Summer Edition 2025 en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:223,name:"Hyperion Athletics",disc:"Fitness Funcional",city:"Las Rozas",prov:"Madrid",country:"España",date:"2025-06-07",price:70,fmts:["Parejas"],desc:"Hyperion Athletics en Las Rozas, Madrid.",feat:false,verified:false,ratings:[]},
  {id:224,name:"CFHK 2025",disc:"CrossFit",city:"Barakaldo",prov:"Bizkaia",country:"España",date:"2025-06-28",price:370,fmts:["Cuartetos"],desc:"CFHK 2025 en Barakaldo, Bizkaia.",feat:true,verified:false,ratings:[]},
  {id:225,name:"O2 Limit Challenge 2025 Teams",disc:"CrossFit",city:"Sierra Nevada",prov:"Granada",country:"España",date:"2025-07-04",price:260,fmts:["Cuartetos"],desc:"O2 Limit Challenge 2025 edicion equipos en Sierra Nevada.",feat:true,verified:false,ratings:[]},
  {id:226,name:"XTREME GAMES",disc:"CrossFit",city:"La Garriga",prov:"Barcelona",country:"España",date:"2025-07-12",price:89,fmts:["Parejas"],desc:"Xtreme Games en La Garriga, Barcelona.",feat:false,verified:false,ratings:[]},
  {id:227,name:"Royal Beach Games III",disc:"CrossFit",city:"Aguilas",prov:"Murcia",country:"España",date:"2025-07-12",price:240,fmts:["Parejas","Cuartetos"],desc:"Royal Beach Games III edicion en Aguilas, Murcia.",feat:true,verified:false,ratings:[]},
  {id:228,name:"NAIZ Battle 2025",disc:"CrossFit",city:"Labastida",prov:"Alava",country:"España",date:"2025-08-23",price:180,fmts:["Cuartetos"],desc:"Naiz Battle 2025 en Labastida, Alava.",feat:true,verified:false,ratings:[]},
  {id:229,name:"Trocadero Games",disc:"CrossFit",city:"Cádiz",prov:"Cádiz",country:"España",date:"2025-09-13",price:90,fmts:["Parejas"],desc:"Trocadero Games en Cádiz.",feat:true,verified:false,ratings:[]},
  {id:230,name:"Almansa CrossGames 2025",disc:"CrossFit",city:"Almansa",prov:"Albacete",country:"España",date:"2025-09-13",price:70,fmts:["Parejas"],desc:"Almansa CrossGames 2025 en Almansa, Albacete.",feat:true,verified:false,ratings:[]},
  {id:231,name:"Costa Blanca Games 2025",disc:"Hyrox",city:"Alicante",prov:"Alicante",country:"España",date:"2025-09-27",price:95,fmts:["Individual","Parejas","Cuartetos"],desc:"Costa Blanca Games Hyrox Test 2025 en Alicante.",feat:true,verified:false,ratings:[]},
  {id:232,name:"BRAVE CHALLENGE 2025",disc:"Fitness Funcional",city:"Blanes",prov:"Girona",country:"España",date:"2025-09-20",price:55,fmts:["Parejas"],desc:"Brave Challenge 2025 en Blanes, Girona.",feat:true,verified:false,ratings:[]},
  {id:233,name:"Cerdanyola Invitational 2025",disc:"CrossFit",city:"Cerdanyola del Valles",prov:"Barcelona",country:"España",date:"2025-10-04",price:196,fmts:["Cuartetos"],desc:"Cerdanyola Invitational 2025 en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:234,name:"NorthFit Hybrid Donostia",disc:"Fitness Funcional",city:"Donostia",prov:"Guipuzcoa",country:"España",date:"2025-10-18",price:88,fmts:["Individual","Parejas"],desc:"NorthFit Hybrid en Donostia, Guipuzcoa.",feat:true,verified:false,ratings:[]},
  {id:235,name:"Vitality Games 2025",disc:"CrossFit",city:"Móstoles",prov:"Madrid",country:"España",date:"2025-10-25",price:95,fmts:["Parejas"],desc:"Vitality Games 2025 en Móstoles, Madrid.",feat:false,verified:false,ratings:[]},
  {id:236,name:"Flowrace 2025",disc:"OCR",city:"Aguilas",prov:"Murcia",country:"España",date:"2025-09-27",price:60,fmts:["Individual","Parejas"],desc:"Flowrace 2025 en Aguilas, Murcia.",feat:true,verified:false,ratings:[]},
  {id:237,name:"Superchallenge SJD 2025",disc:"CrossFit",city:"Sant Feliu de Llobregat",prov:"Barcelona",country:"España",date:"2025-11-09",price:70,fmts:["Parejas"],desc:"Superchallenge by SJD 2025 en Barcelona.",feat:true,verified:false,ratings:[]},
  {id:238,name:"Gijón Throwdown 2025",disc:"CrossFit",city:"Gijón",prov:"Asturias",country:"España",date:"2025-11-22",price:380,fmts:["Cuartetos"],desc:"Gijón Throwdown 2025 en Gijón, Asturias.",feat:true,verified:false,ratings:[]},
  {id:239,name:"REPbyREP 2025",disc:"Fitness Funcional",city:"Sabadell",prov:"Barcelona",country:"España",date:"2025-11-22",price:80,fmts:["Parejas"],desc:"RepByRep 2025 en Sabadell, Barcelona.",feat:false,verified:false,ratings:[]},
  {id:240,name:"WOD GAMES LA CARLOTA 2025",disc:"CrossFit",city:"La Carlota",prov:"Córdoba",country:"España",date:"2025-11-15",price:100,fmts:["Parejas"],desc:"Wod Games La Carlota 2025 en Córdoba.",feat:true,verified:false,ratings:[]},
  {id:241,name:"12B Reborn Games",disc:"CrossFit",city:"Arona",prov:"Tenerife",country:"España",date:"2025-12-06",price:40,fmts:["Parejas"],desc:"12B Reborn Games en Arona, Tenerife.",feat:false,verified:false,ratings:[]},
  {id:242,name:"MADRIZ WAR OF PAIRS TEAM 2025",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2025-11-29",price:120,fmts:["Cuartetos"],desc:"Madriz War of Pairs Team Edition 2025 en Madrid.",feat:true,verified:false,ratings:[]},
  {id:243,name:"Lx Games 25",disc:"CrossFit",city:"Lisboa",prov:"Portugal",country:"Portugal",date:"2025-10-17",price:155,fmts:["Individual","Cuartetos"],desc:"Lx Games 2025 en Lisboa, Portugal.",feat:true,verified:false,ratings:[]},
  {id:244,name:"Badajoz Elvas Throwdown 2025",disc:"CrossFit",city:"Elvas",prov:"Portugal",country:"Portugal",date:"2025-11-07",price:238,fmts:["Individual","Cuartetos"],desc:"Badajoz Elvas Throwdown 2025 en Elvas, Portugal.",feat:true,verified:false,ratings:[]},
  {id:245,name:"WEZONE THROWDOWN 2025",disc:"CrossFit",city:"Madrid",prov:"Madrid",country:"España",date:"2025-11-22",price:340,fmts:["Cuartetos"],desc:"Wezone Throwdown 2025.",feat:true,verified:false,ratings:[]},
  {id:246,name:"OHANA GAMES 25",disc:"CrossFit",city:"San Bartolome de Tirajana",prov:"Las Palmas",country:"España",date:"2025-05-31",price:150,fmts:["Individual","Trios"],desc:"Ohana Games 25 en Gran Canaria.",feat:true,verified:false,ratings:[]},
  {id:247,name:"Malpey Games 2025",disc:"CrossFit",city:"Málaga",prov:"Málaga",country:"España",date:"2025-09-26",price:135,fmts:["Parejas"],desc:"Malpey Games 2025.",feat:false,verified:false,ratings:[]},
  {id:248,name:"CFHK Hirunaka Gernika 2025",disc:"CrossFit",city:"Gernika",prov:"Bizkaia",country:"España",date:"2025-04-05",price:90,fmts:["Trios"],desc:"CFHK Hirunaka Gernika 2025 en Gernika, Bizkaia.",feat:true,verified:false,ratings:[]},
  {id:249,name:"GORILA GAMES 2025",disc:"CrossFit",city:"Ripoll",prov:"Girona",country:"España",date:"2025-06-22",price:60,fmts:["Parejas"],desc:"Gorila Games 2025 en Ripoll, Girona.",feat:false,verified:false,ratings:[]},
  {id:250,name:"Persevera Team Games 2025",disc:"CrossFit",city:"Estepona",prov:"Málaga",country:"España",date:"2025-11-08",price:120,fmts:["Trios"],desc:"Persevera Team Games 2025 en Estepona, Málaga.",feat:true,verified:false,ratings:[]},
];

const avgS=(arr,k)=>arr.length?arr.reduce((s,r)=>s+(r.scores[k]||0),0)/arr.length:0;
const overall=(r)=>!r.length?0:SCORE_KEYS.reduce((s,k)=>s+avgS(r,k),0)/SCORE_KEYS.length;
const f1=(n)=>n.toFixed(1);
const fd=(d)=>{if(!d)return"";const[y,m,dy]=d.split("-");const mn=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${parseInt(dy)} ${mn[parseInt(m)-1]} ${y}`;};
const Stars=({n,sz=12})=><span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(n)?"#FF6500":"#2a2a2a",fontSize:sz}}>★</span>)}</span>;
const Badge=({disc,sm})=><span style={{background:DISC_COLORS[disc]||"#555",color:"#fff",padding:sm?"1px 5px":"3px 8px",borderRadius:4,fontSize:sm?9:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,display:"inline-block"}}>{disc}</span>;
const VBadge=({sm})=><span style={{background:"rgba(77,166,255,0.15)",color:"#00D264",border:"1px solid rgba(0,210,100,0.35)",padding:sm?"1px 5px":"2px 7px",borderRadius:3,fontSize:sm?9:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>✓ VERIFICADO</span>;
const FBadge=({sm})=><span style={{background:"rgba(255,193,7,0.12)",color:"#FFB300",border:"1px solid rgba(255,193,7,0.25)",padding:sm?"1px 5px":"2px 7px",borderRadius:3,fontSize:sm?9:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>⭐ DESTACADO</span>;

const EventLogo=({ev,size=36})=>{
  const dc=DISC_COLORS[ev.disc]||"#555";
  if(ev.logo)return<img src={ev.logo} alt={ev.name} style={{width:size,height:size,borderRadius:6,objectFit:"cover",border:`1px solid rgba(255,255,255,0.1)`,flexShrink:0}}/>;
  return<div style={{width:size,height:size,borderRadius:6,background:`${dc}22`,border:`1px solid ${dc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:size*0.44,fontWeight:800,color:dc,flexShrink:0}}>{ev.name.charAt(0).toUpperCase()}</div>;
};

const fileToB64=(file)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(file);});

function AdBanner({ad}){
  return<div style={{background:`linear-gradient(135deg,${ad.color}12,#1a1a1a)`,border:`1px solid ${ad.color}28`,borderRadius:10,padding:"11px 15px",marginBottom:9,display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,right:0,background:"rgba(0,0,0,0.5)",padding:"1px 7px",fontSize:9,color:"#555",borderBottomLeftRadius:5,fontFamily:"'Barlow Condensed',sans-serif"}}>PUBLICIDAD</div>
    <div style={{fontSize:26,flexShrink:0}}>{ad.logo}</div>
    <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:ad.color,marginBottom:1}}>{ad.brand}</div><div style={{fontSize:12,color:"#888"}}>{ad.claim}</div></div>
    <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{background:ad.color,color:"#fff",padding:"6px 13px",borderRadius:6,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'Barlow Condensed',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{ad.cta} →</a>
  </div>;
}

function SponsorSlot(){
  const ad=ADS[0];
  return<div style={{background:`linear-gradient(90deg,${ad.color}15,#161616)`,border:`1px solid ${ad.color}22`,borderRadius:10,padding:"9px 15px",marginBottom:12,display:"flex",alignItems:"center",gap:10,position:"relative"}}>
    <div style={{position:"absolute",top:0,right:0,background:"rgba(0,0,0,0.6)",padding:"1px 7px",fontSize:9,color:"#555",borderBottomLeftRadius:5,fontFamily:"'Barlow Condensed',sans-serif"}}>PATROCINADOR OFICIAL</div>
    <span style={{fontSize:20}}>{ad.logo}</span>
    <div style={{flex:1}}><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:ad.color}}>{ad.brand}</span><span style={{fontSize:12,color:"#777",marginLeft:8}}>{ad.claim}</span></div>
    <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{color:ad.color,border:`1px solid ${ad.color}`,background:"transparent",padding:"4px 11px",borderRadius:5,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:"'Barlow Condensed',sans-serif"}}>Ver mas</a>
  </div>;
}

function ContactForm({onClose}){
  const[f,setF]=useState({name:"",email:"",event:"",msg:"",plan:"verified"});
  const[sent,setSent]=useState(false);
  const PLANS=[
    {id:"verified",label:"Verificado",price:"49 EUR/evento",desc:"Badge oficial, mejor posicion en listados, perfil enriquecido"},
    {id:"featured",label:"Destacado",price:"99 EUR/evento",desc:"Todo lo anterior + pin especial en mapa + slot en Proximos"},
  ];
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:22,maxWidth:460,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
      {sent?<div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:36,marginBottom:10}}>✓</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#4CAF50",marginBottom:6}}>Solicitud enviada</div>
        <p style={{fontSize:13,color:"#888",marginBottom:18}}>Te contactamos en menos de 24h para confirmar y gestionar el pago.</p>
        <button onClick={onClose} style={{background:"#FF6500",color:"#fff",border:"none",padding:"8px 20px",borderRadius:6,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cerrar</button>
      </div>:<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:21,fontWeight:800,marginBottom:2}}>Verifica tu evento</div><p style={{fontSize:12,color:"#888"}}>Aumenta la visibilidad y confianza en FitEvents World</p></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#555",fontSize:20,padding:"0 4px"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {PLANS.map(p=><div key={p.id} onClick={()=>setF(x=>({...x,plan:p.id}))} style={{background:f.plan===p.id?"rgba(255,107,43,0.1)":"#1a1a1a",border:`1px solid ${f.plan===p.id?"#FF6500":"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:11,cursor:"pointer"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:f.plan===p.id?"#FF6500":"#f0f0f0",marginBottom:2}}>{p.label}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#FF6500",marginBottom:4}}>{p.price}</div>
            <div style={{fontSize:11,color:"#777",lineHeight:1.4}}>{p.desc}</div>
          </div>)}
        </div>
        <input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Nombre del organizador *" style={{width:"100%",padding:"8px 11px",marginBottom:8}}/>
        <input value={f.email} onChange={e=>setF(x=>({...x,email:e.target.value}))} placeholder="Email de contacto *" style={{width:"100%",padding:"8px 11px",marginBottom:8}}/>
        <input value={f.event} onChange={e=>setF(x=>({...x,event:e.target.value}))} placeholder="Nombre del evento *" style={{width:"100%",padding:"8px 11px",marginBottom:8}}/>
        <textarea value={f.msg} onChange={e=>setF(x=>({...x,msg:e.target.value}))} placeholder="Informacion adicional o preguntas..." style={{width:"100%",padding:"8px 11px",height:66,resize:"none",marginBottom:12}}/>
        <button onClick={async()=>{
  if(!f.name||!f.email||!f.event)return;
  try{
    await emailjs.send("service_3e3tn5k","template_wlemyhc",{
      organizer_name:f.name,
      organizer_email:f.email,
      event_name:f.event,
      plan:f.plan==="verified"?"Verificado (49€)":"Destacado (99€)",
      message:f.msg||"Sin mensaje adicional",
      name:f.name,
      email:f.email,
      message:f.msg||"-"
    },"bz1Do_nJPcpdEza1O");
    setSent(true);
  }catch(e){console.error(e);alert("Error al enviar. Inténtalo de nuevo.");}
}} style={{background:"#FF6500",color:"#fff",border:"none",padding:"9px 0",borderRadius:6,fontSize:14,fontWeight:700,cursor:"pointer",width:"100%"}}>Enviar solicitud</button>
        <p style={{fontSize:11,color:"#555",textAlign:"center",marginTop:7}}>Te contactamos en menos de 24h · Pago tras confirmacion</p>
      </>}
    </div>
  </div>;
}

function AdminEventEditor({ev,onSave,onClose}){
  const[d,setD]=useState({...ev});
  const IN2={width:"100%",padding:"7px 10px",marginBottom:7};
  const PL2=(a)=>({background:a?"#FF6500":"#1a1a1a",color:a?"#fff":"#777",border:`1px solid ${a?"#FF6500":"rgba(255,255,255,0.1)"}`,padding:"3px 8px",borderRadius:16,fontSize:11,cursor:"pointer"});
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
    <div style={{background:"#161616",border:"1px solid rgba(255,107,43,0.25)",borderRadius:12,padding:20,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:"#FF6500"}}>Editar evento #{ev.id}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#555",fontSize:18,cursor:"pointer"}}>✕</button>
      </div>
      <input value={d.name} onChange={e=>setD(x=>({...x,name:e.target.value}))} placeholder="Nombre" style={IN2}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <select value={d.disc} onChange={e=>setD(x=>({...x,disc:e.target.value}))} style={IN2}>{DISCIPLINES.slice(1).map(ds=><option key={ds}>{ds}</option>)}</select>
        <input value={d.country} onChange={e=>setD(x=>({...x,country:e.target.value}))} placeholder="Pais" style={IN2}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <input value={d.city} onChange={e=>setD(x=>({...x,city:e.target.value}))} placeholder="Ciudad" style={IN2}/>
        <select value={d.prov} onChange={e=>setD(x=>({...x,prov:e.target.value}))} style={IN2}>{Object.keys(PC).map(p=><option key={p}>{p}</option>)}</select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <input type="date" value={d.date} onChange={e=>setD(x=>({...x,date:e.target.value}))} style={IN2}/>
        <input type="number" value={d.price} onChange={e=>setD(x=>({...x,price:Number(e.target.value)}))} placeholder="Precio (0=Gratis)" style={IN2}/>
      </div>
      <div style={{fontSize:11,color:"#888",marginBottom:5}}>Formatos:</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
        {FORMATS.map(f=><button key={f} onClick={()=>setD(x=>({...x,fmts:x.fmts.includes(f)?x.fmts.filter(y=>y!==f):[...x.fmts,f]}))} style={PL2((d.fmts||[]).includes(f))}>{f}</button>)}
      </div>
      <textarea value={d.desc} onChange={e=>setD(x=>({...x,desc:e.target.value}))} placeholder="Descripcion..." style={{...IN2,height:60,resize:"none"}}/>
      <input value={d.url||""} onChange={e=>setD(x=>({...x,url:e.target.value}))} placeholder="Web del evento (https://...)" style={IN2}/><input value={d.discount||""} onChange={e=>setD(x=>({...x,discount:e.target.value}))} placeholder="Código descuento (ej: FITEVENTS10)" style={IN2}/><input value={d.discountDesc||""} onChange={e=>setD(x=>({...x,discountDesc:e.target.value}))} placeholder="Descripción del descuento (ej: 10% en inscripción)" style={IN2}/>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <button onClick={()=>setD(x=>({...x,verified:!x.verified}))} style={{flex:1,background:d.verified?"rgba(77,166,255,0.15)":"#1a1a1a",border:`1px solid ${d.verified?"#4DA6FF":"rgba(255,255,255,0.1)"}`,color:d.verified?"#4DA6FF":"#555",padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {d.verified?"✓ VERIFICADO ON":"VERIFICADO OFF"}
        </button>
        <button onClick={()=>setD(x=>({...x,feat:!x.feat}))} style={{flex:1,background:d.feat?"rgba(255,193,7,0.12)":"#1a1a1a",border:`1px solid ${d.feat?"#FFB300":"rgba(255,255,255,0.1)"}`,color:d.feat?"#FFB300":"#555",padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {d.feat?"⭐ DESTACADO ON":"DESTACADO OFF"}
        </button>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"#888",marginBottom:5}}>Logo del evento:</div>
        <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",background:"#1a1a1a",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:7,padding:"7px 11px"}}>
          {d.logo?<img src={d.logo} style={{width:36,height:36,borderRadius:5,objectFit:"cover"}}/>:<div style={{width:36,height:36,borderRadius:5,background:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#444"}}>🖼</div>}
          <div style={{flex:1}}><div style={{fontSize:12,color:"#888"}}>{d.logo?"Logo cargado — click para cambiar":"Subir logo o icono"}</div></div>
          {d.logo&&<button onClick={e=>{e.preventDefault();setD(x=>({...x,logo:null}));}} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer"}}>✕</button>}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f||f.size>2*1024*1024)return;const b64=await fileToB64(f);setD(x=>({...x,logo:b64}));}}/>
        </label>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>onSave(d)} style={{flex:1,background:"#FF6500",color:"#fff",border:"none",padding:"9px 0",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer"}}>Guardar cambios</button>
        <button onClick={onClose} style={{background:"#2a2a2a",color:"#fff",border:"none",padding:"9px 16px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancelar</button>
      </div>
    </div>
  </div>;
}

function AdminPanel({evs,setEvs,onClose,sponsors,setSponsors}){
  const[adminTab,setAdminTab]=useState("events");const[newSp,setNewSp]=useState({brand:"",desc:"",code:"",discount:"",url:"",color:"#FF6500",logo:null});
  const saveSponsor=async()=>{if(!newSp.brand||!newSp.code)return;const id=Date.now().toString();await setDoc(doc(db,"sponsors",id),{...newSp,id});setNewSp({brand:"",desc:"",code:"",discount:"",url:"",color:"#FF6500",logo:null});};
  const deleteSponsor=async(id)=>{await updateDoc(doc(db,"sponsors",id),{deleted:true});};
  const[search,setSearch]=useState("");const[editing,setEditing]=useState(null);
  const toggle=async(id,field)=>{const ev=evs.find(e=>e.id===id);if(!ev)return;await updateDoc(doc(db,"events",String(id)),{[field]:!ev[field]});};
  const saveEdit=async(updated)=>{await updateDoc(doc(db,"events",String(updated.id)),updated);setEditing(null);};
  const filtered=evs.filter(e=>e.name.toLowerCase().includes(search.toLowerCase()));
  return<>
    {editing&&<AdminEventEditor ev={editing} onSave={saveEdit} onClose={()=>setEditing(null)}/>}
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#141414",borderBottom:"1px solid rgba(255,107,43,0.2)",padding:"10px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:"#FF6500"}}>⚙ ADMIN — FitEvents World</span>
        <button onClick={()=>setAdminTab(x=>x==="events"?"sponsors":"events")} style={{background:"rgba(255,107,43,0.12)",color:"#FF6500",border:"1px solid rgba(255,107,43,0.25)",padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:8}}>{adminTab==="events"?"🎟️ Sponsors":"📋 Eventos"}</button>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar evento..." style={{padding:"5px 10px",flex:1,maxWidth:200}}/>
        <span style={{fontSize:12,color:"#555"}}>{filtered.length} eventos</span>
        <button onClick={onClose} style={{background:"#2a2a2a",color:"#fff",border:"none",padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:600,marginLeft:"auto"}}>Cerrar</button>
      </div>
      {adminTab==="sponsors"?<div style={{flex:1,overflowY:"auto",padding:"12px 18px"}}>
        <div style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:"#FF6500",marginBottom:10}}>Añadir sponsor</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input value={newSp.brand} onChange={e=>setNewSp(x=>({...x,brand:e.target.value}))} placeholder="Marca *" style={{padding:"7px 10px"}}/>
            <input value={newSp.code} onChange={e=>setNewSp(x=>({...x,code:e.target.value}))} placeholder="Código *" style={{padding:"7px 10px"}}/>
            <input value={newSp.discount} onChange={e=>setNewSp(x=>({...x,discount:e.target.value}))} placeholder="Descuento (ej: 10% de descuento)" style={{padding:"7px 10px"}}/>
            <input value={newSp.url} onChange={e=>setNewSp(x=>({...x,url:e.target.value}))} placeholder="URL tienda" style={{padding:"7px 10px"}}/>
            <input value={newSp.color} onChange={e=>setNewSp(x=>({...x,color:e.target.value}))} placeholder="Color (ej: #FF6500)" style={{padding:"7px 10px"}}/>
            <input value={newSp.desc} onChange={e=>setNewSp(x=>({...x,desc:e.target.value}))} placeholder="Descripción" style={{padding:"7px 10px"}}/>
          </div>
          <div style={{marginTop:8,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",background:"#111",border:"1px dashed #333",borderRadius:7,padding:"7px 11px"}}>
              {newSp.logo?<img src={newSp.logo} style={{width:36,height:36,borderRadius:5,objectFit:"cover"}}/>:<div style={{width:36,height:36,borderRadius:5,background:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#444"}}>🖼</div>}
              <div style={{fontSize:12,color:"#888"}}>{newSp.logo?"Logo cargado — click para cambiar":"Subir logo del sponsor"}</div>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f||f.size>2*1024*1024)return;const b64=await fileToB64(f);setNewSp(x=>({...x,logo:b64}));}}/>
            </label>
          </div>
          <button onClick={saveSponsor} style={{background:"#FF6500",color:"#fff",border:"none",padding:"8px 20px",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>Añadir sponsor</button>
        </div>
        {sponsors.filter(s=>!s.deleted).length===0?<div style={{color:"#555",fontSize:13,textAlign:"center",padding:"20px 0"}}>No hay sponsors activos</div>:sponsors.filter(s=>!s.deleted).map(s=><div key={s.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          {s.logo?<img src={s.logo} style={{width:36,height:36,borderRadius:5,objectFit:"cover"}}/>:<div style={{width:36,height:36,borderRadius:5,background:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#444"}}>🏷️</div>}
          <div style={{flex:1}}><div style={{fontWeight:700,color:s.color||"#FF6500"}}>{s.brand}</div><div style={{fontSize:11,color:"#888"}}>{s.code} · {s.discount}</div></div>
          <button onClick={()=>deleteSponsor(s.id)} style={{background:"rgba(239,83,80,0.12)",color:"#EF5350",border:"1px solid rgba(239,83,80,0.25)",padding:"4px 10px",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer"}}>Eliminar</button>
        </div>)}
      </div>:<>
        <div style={{background:"#111",padding:"5px 18px",display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px",gap:6,flexShrink:0}}>
          <span style={{fontSize:10,color:"#555",fontWeight:700}}>EVENTO</span>
          <span style={{fontSize:10,color:"#4DA6FF",fontWeight:700,textAlign:"center"}}>VERIF.</span>
          <span style={{fontSize:10,color:"#FFB300",fontWeight:700,textAlign:"center"}}>DEST.</span>
          <span style={{fontSize:10,color:"#4CAF50",fontWeight:700,textAlign:"center"}}>LOGO</span>
          <span style={{fontSize:10,color:"#FF6500",fontWeight:700,textAlign:"center"}}>EDITAR</span>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"4px 18px 16px"}}>
          {filtered.map(ev=><div key={ev.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px",gap:6,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><EventLogo ev={ev} size={26}/><div><div style={{fontSize:12,fontWeight:600}}>{ev.name}</div><div style={{fontSize:10,color:"#555"}}>{ev.city} · {fd(ev.date)} · {(ev.fmts||[]).join(", ")}</div></div></div>
            <div style={{textAlign:"center"}}><button onClick={()=>toggle(ev.id,"verified")} style={{background:ev.verified?"rgba(77,166,255,0.15)":"#1a1a1a",border:`1px solid ${ev.verified?"#4DA6FF":"rgba(255,255,255,0.08)"}`,color:ev.verified?"#4DA6FF":"#555",padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer"}}>{ev.verified?"✓":"–"}</button></div>
            <div style={{textAlign:"center"}}><button onClick={()=>toggle(ev.id,"feat")} style={{background:ev.feat?"rgba(255,193,7,0.12)":"#1a1a1a",border:`1px solid ${ev.feat?"#FFB300":"rgba(255,255,255,0.08)"}`,color:ev.feat?"#FFB300":"#555",padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer"}}>{ev.feat?"⭐":"–"}</button></div>
            <div style={{textAlign:"center"}}><label style={{cursor:"pointer",display:"inline-block"}}>{ev.logo?<img src={ev.logo} style={{width:26,height:26,borderRadius:4,objectFit:"cover",border:"1px solid #333"}}/>:<div style={{width:26,height:26,borderRadius:4,background:"#1a1a1a",border:"1px dashed #333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#555"}}>+</div>}<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const b64=await fileToB64(f);setEvs(x=>x.map(ev2=>ev2.id===ev.id?{...ev2,logo:b64}:ev2));}}/></label>{ev.logo&&<button onClick={()=>setEvs(x=>x.map(ev2=>ev2.id===ev.id?{...ev2,logo:null}:ev2))} style={{display:"block",margin:"1px auto 0",background:"none",border:"none",color:"#555",fontSize:9,cursor:"pointer"}}>✕</button>}</div>
            <div style={{textAlign:"center",display:"flex",gap:4,justifyContent:"center"}}><button onClick={()=>setEditing(ev)} style={{background:"rgba(255,107,43,0.12)",border:"1px solid rgba(255,107,43,0.25)",color:"#FF6500",padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer"}}>✏ Edit</button><button onClick={async()=>{if(!window.confirm(`¿Eliminar "${ev.name}"? Esta acción no se puede deshacer.`))return;const{deleteDoc}=await import('firebase/firestore');await deleteDoc(doc(db,"events",String(ev.id)));}} style={{background:"rgba(239,83,80,0.12)",border:"1px solid rgba(239,83,80,0.25)",color:"#EF5350",padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer"}}>🗑</button></div>
          </div>)}
        </div>
      </>}
    </div>
  </>;
}

function CalendarView({evs,setSel,setView,isMobile}){
  const[curDate,setCurDate]=useState(new Date());
  const[selDay,setSelDay]=useState(null);
  const[fDisc,setFDisc]=useState("Todos");
  const DISC_COLORS_CAL={CrossFit:"#FF6500",Hyrox:"#4DA6FF",OCR:"#4CAF50",Fuerza:"#B56AFF","Fitness Funcional":"#FFB300"};
  const year=curDate.getFullYear(),month=curDate.getMonth();
  const monthNames=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const firstDay=(new Date(year,month,1).getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const eventsInMonth=evs.filter(e=>{if(!e.date)return false;const[y,m]=e.date.split("-");return parseInt(y)===year&&parseInt(m)-1===month&&(fDisc==="Todos"||e.disc===fDisc);});
  const evsByDay={};eventsInMonth.forEach(e=>{const d=parseInt(e.date.split("-")[2]);if(!evsByDay[d])evsByDay[d]=[];evsByDay[d].push(e);});
  const selEvents=selDay?evsByDay[selDay]||[]:eventsInMonth;
  const prevMonth=()=>{setCurDate(new Date(year,month-1,1));setSelDay(null);};
  const nextMonth=()=>{setCurDate(new Date(year,month+1,1));setSelDay(null);};
  const BT2=(a)=>({background:a?"#FF6500":"#1a1a1a",color:a?"#fff":"#777",border:`1px solid ${a?"#FF6500":"rgba(255,255,255,0.08)"}`,padding:"3px 10px",borderRadius:20,fontSize:11,cursor:"pointer"});
  return<div>
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:12,letterSpacing:1,textTransform:"uppercase",textAlign:"center"}}>Calendario</div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center",justifyContent:"center"}}>
      {["Todos","CrossFit","Hyrox","OCR","Fuerza","Fitness Funcional"].map(d=><button key={d} onClick={()=>{setFDisc(d);setSelDay(null);}} style={BT2(fDisc===d)}>{d}</button>)}
    </div>
    <div style={{display:"flex",gap:16,alignItems:"flex-start",flexDirection:isMobile?"column":"row"}}>
      <div style={{width:isMobile?"100%":480,flexShrink:0}}>
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <button onClick={prevMonth} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#fff",width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:14}}>‹</button>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,textTransform:"uppercase"}}>{monthNames[month]} {year}</span>
            <button onClick={nextMonth} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#fff",width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:14}}>›</button>
          </div>
          <div style={{padding:"10px 12px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
              {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#555",fontWeight:700,padding:"3px 0"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1,dayEvs=evsByDay[day]||[],hasSel=selDay===day;
                return<div key={day} onClick={()=>setSelDay(hasSel?null:day)} style={{height:46,borderRadius:6,background:hasSel?"rgba(255,101,0,0.2)":dayEvs.length?"#1e1e1e":"#141414",border:hasSel?"1px solid #FF6500":dayEvs.length?"1px solid #2a2a2a":"1px solid transparent",cursor:dayEvs.length?"pointer":"default",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"3px 2px",transition:"all 0.15s"}}>
                  <span style={{fontSize:10,color:hasSel?"#FF6500":dayEvs.length?"#fff":"#444",fontWeight:dayEvs.length?700:400}}>{day}</span>
                  {dayEvs.length>0&&<div style={{display:"flex",gap:2,marginTop:2,flexWrap:"wrap",justifyContent:"center"}}>
                    {dayEvs.slice(0,4).map((e,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:DISC_COLORS_CAL[e.disc]||"#555"}}/>)}
                    {dayEvs.length>4&&<div style={{width:5,height:5,borderRadius:"50%",background:"#555"}}/>}
                  </div>}
                </div>;
              })}
            </div>
          </div>
          <div style={{padding:"6px 12px 8px",display:"flex",gap:10,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            {Object.entries(DISC_COLORS_CAL).map(([d,c])=><span key={d} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#555"}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{d}</span>)}
          </div>
        </div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:10,color:"#FF6500"}}>
          {selDay?selDay+" de "+monthNames[month]+" · "+selEvents.length+" eventos":monthNames[month]+" "+year+" · "+selEvents.length+" eventos"}
        </div>
        {selEvents.length===0?<div style={{color:"#444",fontSize:13,textAlign:"center",padding:"40px 0",background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10}}>Sin eventos {selDay?"el día "+selDay:""} este mes</div>:
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:isMobile?"auto":520,overflowY:isMobile?"visible":"auto"}}>
          {selEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>{const oa=overall(ev.ratings);return<div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderLeft:`3px solid ${DISC_COLORS_CAL[ev.disc]||"#555"}`,borderRadius:8,padding:"9px 12px",display:"flex",gap:10,alignItems:"center",cursor:"pointer",flexShrink:0}} onClick={()=>{setSel(ev);setView("det");}}>
            <EventLogo ev={ev} size={30}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:4,marginBottom:2,flexWrap:"wrap",alignItems:"center"}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.name}</div>
              <div style={{fontSize:10,color:"#888"}}>{ev.city} · {fd(ev.date)} · {ev.price===0?"Gratis":`${ev.price}€`}</div>
            </div>
            {oa>0&&<div style={{textAlign:"center",minWidth:28,flexShrink:0}}><div style={{fontSize:14,fontWeight:900,color:"#FF6500",fontFamily:"'Barlow Condensed',sans-serif"}}>{f1(oa)}</div><Stars n={oa} sz={7}/></div>}
          </div>;})}
        </div>}
      </div>
    </div>
  </div>;
}
function CmpSearchBox({evs,selectedId,otherId,onSelect,label}){
  const[q,setQ]=useState("");const[open,setOpen]=useState(false);
  const selected=evs.find(e=>e.id===selectedId);
  const results=useMemo(()=>{
    const base=evs.filter(e=>e.id!==otherId);
    if(!q.trim())return base.slice(0,12);
    return base.filter(e=>e.name.toLowerCase().includes(q.toLowerCase())||e.city.toLowerCase().includes(q.toLowerCase())).slice(0,12);
  },[evs,q,otherId]);
  return<div style={{position:"relative"}}>
    <div style={{fontSize:11,color:"#aaa",marginBottom:5,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
    {selected?<div style={{background:"#1a1a1a",border:"1px solid #FF6500",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
      <EventLogo ev={selected} size={36}/>
      <div style={{flex:1}}>
        <div style={{display:"flex",gap:4,marginBottom:3,alignItems:"center"}}><Badge disc={selected.disc} sm/>{selected.verified&&<VBadge sm/>}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,textTransform:"uppercase",color:"#fff"}}>{selected.name}</div>
        <div style={{fontSize:11,color:"#bbb"}}>{selected.city} · {fd(selected.date)}</div>
      </div>
      <button onClick={()=>{onSelect(null);setQ("");}} style={{background:"none",border:"none",color:"#888",fontSize:16,cursor:"pointer",padding:"0 4px"}}>✕</button>
    </div>:
    <div>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#666",fontSize:13}}>🔍</span>
        <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder="Buscar evento por nombre o ciudad..." style={{width:"100%",padding:"10px 10px 10px 34px",background:"#1a1a1a",border:"1px solid #444",borderRadius:8,color:"#fff",fontSize:13}}/>
      </div>
      {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1e1e1e",border:"1px solid #444",borderRadius:8,zIndex:50,marginTop:4,overflow:"auto",maxHeight:320,boxShadow:"0 8px 24px rgba(0,0,0,0.7)"}}>
        {results.length>0?results.map(ev=><div key={ev.id} onMouseDown={()=>{onSelect(ev.id);setQ("");setOpen(false);}} style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <EventLogo ev={ev} size={30}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:4,marginBottom:2}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,textTransform:"uppercase",color:"#fff"}}>{ev.name}</div>
            <div style={{fontSize:10,color:"#bbb"}}>{ev.city} · {fd(ev.date)} · {ev.price===0?"Gratis":`${ev.price}€`}</div>
          </div>
        </div>):<div style={{padding:"14px",color:"#666",fontSize:12,textAlign:"center"}}>Sin resultados para "{q}"</div>}
      </div>}
    </div>}
  </div>;
}

function CmpView({evs,cmpIds,setCmpIds,cmpEvs,setSel,setView}){
  const[a,b]=cmpEvs.length===2?cmpEvs:[null,null];
  const rows=a&&b?[
    {l:"Disciplina",va:<Badge disc={a.disc} sm/>,vb:<Badge disc={b.disc} sm/>},
    {l:"Verificado",va:a.verified?<VBadge sm/>:<span style={{color:"#aaa",fontSize:11}}>No</span>,vb:b.verified?<VBadge sm/>:<span style={{color:"#aaa",fontSize:11}}>No</span>},
    {l:"Ciudad",va:<span style={{color:"#eee"}}>{a.city}</span>,vb:<span style={{color:"#eee"}}>{b.city}</span>},{l:"Fecha",va:<span style={{color:"#eee"}}>{fd(a.date)}</span>,vb:<span style={{color:"#eee"}}>{fd(b.date)}</span>},
    {l:"Precio",va:a.price===0?"Gratis":`${a.price}€`,vb:b.price===0?"Gratis":`${b.price}€`,cmp:(x,y)=>x.price<y.price},
    {l:"Puntuacion",va:overall(a.ratings)>0?f1(overall(a.ratings)):"—",vb:overall(b.ratings)>0?f1(overall(b.ratings)):"—",cmp:(x,y)=>overall(x.ratings)>overall(y.ratings)},
    ...SCORE_KEYS.map(k=>({l:SLABELS[k],va:avgS(a.ratings,k)>0?f1(avgS(a.ratings,k)):"—",vb:avgS(b.ratings,k)>0?f1(avgS(b.ratings,k)):"—",cmp:(x,y)=>avgS(x.ratings,k)>avgS(y.ratings,k)})),
  ]:[];
  return<div>
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,letterSpacing:1,textTransform:"uppercase"}}>Comparar</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
      <CmpSearchBox evs={evs} selectedId={cmpIds[0]} otherId={cmpIds[1]} onSelect={id=>setCmpIds(x=>{const n=[...x];n[0]=id;return n.filter(Boolean);})} label="Evento 1"/>
      <CmpSearchBox evs={evs} selectedId={cmpIds[1]} otherId={cmpIds[0]} onSelect={id=>setCmpIds(x=>{const n=[...x];n[1]=id;return n.filter(Boolean);})} label="Evento 2"/>
    </div>
    {a&&b?<div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"#1a1a1a"}}>
        <div style={{padding:"10px 14px",fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:1}}>CATEGORÍA</div>
        {[a,b].map((ev,i)=><div key={i} onClick={()=>{setSel(ev);setView("det");}} style={{padding:"10px 14px",textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.06)",cursor:"pointer"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:DISC_COLORS[ev.disc]||"#f0f0f0",textTransform:"uppercase"}}>{ev.name}</div>
          <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{ev.city}</div>
        </div>)}
      </div>
      {rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{padding:"9px 14px",fontSize:11,color:"#ccc",fontWeight:600}}>{r.l}</div>
        {[a,b].map((ev,j)=>{const w=r.cmp&&r.cmp(j===0?a:b,j===0?b:a);return<div key={j} style={{padding:"9px 14px",textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.04)",background:w?"rgba(76,175,80,0.07)":"transparent",color:w?"#4CAF50":"#eee",fontSize:12,fontWeight:w?700:400}}>{j===0?r.va:r.vb}{w&&<span style={{marginLeft:4,fontSize:10}}>✓</span>}</div>;})}
      </div>)}
    </div>:<div style={{textAlign:"center",padding:"60px 0",color:"#333",fontSize:13}}>Busca y selecciona dos eventos para compararlos</div>}
  </div>;
}

let _gc={ok:false,geo:null,esp:null};
function MapView({events,onCity}){
  const svgRef=useRef(null);const pinRef=useRef(null);
  const[st,setSt]=useState("loading");const tRef=useRef(null);
  const pins=useMemo(()=>{
    const m={};
    events.filter(e=>e.city!=="Online").forEach(e=>{
      const c=PC[e.prov]||PC[e.city]||PC[e.country];if(!c)return;
      const k=`${Math.round(c.lat*10)}_${Math.round(c.lon*10)}`;
      if(!m[k])m[k]={lat:c.lat,lon:c.lon,cities:[],n:0,v:false};
      if(!m[k].cities.includes(e.city))m[k].cities.push(e.city);
      m[k].n++;if(e.verified)m[k].v=true;
    });
    return Object.values(m);
  },[events]);
  const drawPins=useCallback((proj,t)=>{
    const svg=d3.select(svgRef.current);let c=svg.select(".pins-layer").node();if(!c){svg.append("g").attr("class","pins-layer");c=svg.select(".pins-layer").node();}if(!c)return;
    while(c.firstChild)c.removeChild(c.firstChild);
    pins.forEach(p=>{
      const xy=proj([p.lon,p.lat]);if(!xy)return;
      const[sx,sy]=t?[t.applyX(xy[0]),t.applyY(xy[1])]:xy;
      const g=document.createElementNS("http://www.w3.org/2000/svg","g");
      g.setAttribute("transform",`translate(${sx},${sy})`);g.style.cursor="pointer";
      const ci=document.createElementNS("http://www.w3.org/2000/svg","circle");
      ci.setAttribute("r","11");ci.setAttribute("fill",p.v?"#4DA6FF":"#FF6500");ci.setAttribute("stroke","#fff");ci.setAttribute("stroke-width","2");
      const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
      tx.setAttribute("text-anchor","middle");tx.setAttribute("dy","4");tx.setAttribute("fill","#fff");tx.setAttribute("font-size","9");tx.setAttribute("font-weight","700");tx.setAttribute("font-family","Barlow Condensed,sans-serif");tx.textContent=p.n;
      g.addEventListener("mouseenter",()=>{ci.setAttribute("r","13");});g.addEventListener("mouseleave",()=>{ci.setAttribute("r","11");});
      g.addEventListener("click",()=>onCity(p.cities));
      g.appendChild(ci);g.appendChild(tx);c.appendChild(g);
    });
  },[pins,onCity]);
  useEffect(()=>{
    if(_gc.ok&&_gc.geo){setSt("ready");return;}
    let dead=false;
    (async()=>{try{if(!_gc.ok){_gc.ok=true;}if(!_gc.geo){const r=await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");_gc.geo=await r.json();}if(!_gc.esp){try{const r2=await fetch("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-provinces.geojson");_gc.esp=await r2.json();}catch(e2){_gc.esp=null;}}if(!dead)setSt("ready");}catch(e){if(!dead)setSt("error");}})();
    return()=>{dead=true;};
  },[]);
  useEffect(()=>{
    if(st!=="ready"||!svgRef.current)return;(async()=>{
    const W=svgRef.current.clientWidth||800,H=400;
    const tp=topojson;
    const proj=d3.geoNaturalEarth1().scale(140).translate([W/2,H/2]);const feature=tp.feature;
    const path=d3.geoPath().projection(proj);
    const sp=proj([-3.7,40.4]);
    const iT=d3.zoomIdentity.translate(W/2-sp[0]*4,H/2-sp[1]*4).scale(4);
    tRef.current={proj,iT,d3};
    const svg=d3.select(svgRef.current);svg.selectAll("*").remove();
    const ctries=feature(_gc.geo,_gc.geo.objects.countries);
    const zoom=d3.zoom().scaleExtent([0.8,20]).on("zoom",e=>{gm.attr("transform",e.transform);drawPins(proj,e.transform);});
    svg.call(zoom);
    const gm=svg.append("g");
    gm.selectAll("path").data(ctries.features).enter().append("path").attr("d",path).attr("fill","#1e2530").attr("stroke","#2d3748").attr("stroke-width",0.5);
    if(_gc.esp&&_gc.esp.features){gm.selectAll(".esp-prov").data(_gc.esp.features).enter().append("path").attr("class","esp-prov").attr("d",path).attr("fill","none").attr("stroke","#3d5068").attr("stroke-width",0.05);}
    svg.call(zoom.transform,iT);drawPins(proj,iT);
  })();},[st,drawPins]);
  const go=(t)=>{if(!tRef.current)return;const{d3,proj,iT}=tRef.current;const svg=d3.select(svgRef.current);const zoom=d3.zoom().scaleExtent([0.8,20]).on("zoom",e=>{d3.select(svgRef.current).select("g").attr("transform",e.transform);drawPins(proj,e.transform);});svg.call(zoom);svg.transition().duration(600).call(zoom.transform,t==="es"?iT:d3.zoomIdentity);};
  return<div style={{position:"relative",background:"#0d1117",borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
    {st==="loading"&&<div style={{height:380,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><div style={{width:30,height:30,border:"3px solid #333",borderTopColor:"#FF6500",borderRadius:"50%",animation:"spin 1s linear infinite"}}/><span style={{color:"#666",fontSize:13}}>Cargando mapa...</span></div>}
    {st==="error"&&<div style={{height:380,display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>No se pudo cargar el mapa</div>}
    {st==="ready"&&<>
      <svg ref={svgRef} width="100%" height="400" style={{display:"block",cursor:"grab"}}></svg>
      <div style={{position:"absolute",top:10,right:10,display:"flex",gap:6}}>
        <button onClick={()=>go("es")} style={{padding:"5px 9px",background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#f0f0f0",fontSize:11}}>España</button>
        <button onClick={()=>go("w")} style={{padding:"5px 9px",background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#f0f0f0",fontSize:11}}>Mundo</button>
      </div>
      <div style={{padding:"5px 12px",display:"flex",gap:12,fontSize:11,color:"#555"}}>
        <span><span style={{color:"#4DA6FF"}}>●</span> Verificado</span>
        <span><span style={{color:"#FF6500"}}>●</span> Sin verificar</span>
        <span style={{marginLeft:"auto"}}>Scroll = zoom · Click = filtrar</span>
      </div>
    </>}
  </div>;
}

export default function App(){const isMobile=useIsMobile();
  const[evs,setEvs]=useState(EVENTS);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(user)=>{
      if(user){
        setMe({u:user.uid,name:user.displayName||user.email.split("@")[0],email:user.email});
        const adminSnap=await getDocs(collection(db,"admins"));
        setIsAdmin(adminSnap.docs.some(d=>d.id===user.uid));
      } else{setMe(null);setIsAdmin(false);}
    });
    return unsub;
  },[]);

  useEffect(()=>{
    const seed=async()=>{
      const snap=await getDocs(collection(db,"events"));
      if(snap.empty){
        const batch=writeBatch(db);
        EVENTS.forEach(ev=>{batch.set(doc(db,"events",String(ev.id)),ev);});
        await batch.commit();
      }
    };
    seed().catch(console.error);
    onSnapshot(collection(db,"sponsors"),(snap)=>{setSponsors(snap.docs.map(d=>d.data()));});const unsub=onSnapshot(collection(db,"events"),(snap)=>{
      const data=snap.docs.map(d=>({...d.data(),id:Number(d.id)||d.id}));
      if(data.length>0){setEvs(data);}
      setLoading(false);
    });
    return unsub;
  },[]);
  const[me,setMe]=useState(null);
  const[aMode,setAMode]=useState("login");const[aF,setAF]=useState({u:"",name:"",p:"",p2:""});
  const[aErr,setAErr]=useState("");const[aOk,setAOk]=useState("");
  const[view,setView]=useState("list");const[sel,setSel]=useState(null);
  const[fDisc,setFDisc]=useState("Todos");const[fCountry,setFCountry]=useState("Todos");
  const[fCities,setFCities]=useState([]);const[search,setSearch]=useState("");const[sort,setSort]=useState("date");
  const[maxP,setMaxP]=useState(500);const[onlyFut,setOnlyFut]=useState(true);const[onlyNew,setOnlyNew]=useState(false);
  const[fFmts,setFFmts]=useState([]);const[showAdv,setShowAdv]=useState(false);
  const[cmpIds,setCmpIds]=useState([]);const[rkDisc,setRkDisc]=useState("Todos");const[rkFmts,setRkFmts]=useState([]);
  const[nEv,setNEv]=useState({name:"",disc:"CrossFit",city:"",prov:"Madrid",country:"España",date:"",price:"",desc:"",url:"",fmts:[],logo:null});
  const[evErr,setEvErr]=useState("");const[evOk,setEvOk]=useState("");
  const[rSc,setRSc]=useState({precio:0,dificultad:0,organizacion:0,ambiente:0,categorias:0});const[rCom,setRCom]=useState("");const[rErr,setRErr]=useState("");
  const[showContact,setShowContact]=useState(false);const[installPrompt,setInstallPrompt]=useState(null);const[sponsors,setSponsors]=useState([]);const[showAdmin,setShowAdmin]=useState(false);const[isAdmin,setIsAdmin]=useState(false);const[loginHint,setLoginHint]=useState(false);const[mapPopup,setMapPopup]=useState(null);
  const today=new Date().toISOString().split("T")[0];
useEffect(()=>{const handler=e=>{e.preventDefault();setInstallPrompt(e);};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler);},[]);
  const countries=useMemo(()=>["Todos",...new Set(evs.map(e=>e.country))].sort(),[evs]);
  const boost=(e)=>(e.verified?3:0)+(e.feat?2:0);
  const filtered=useMemo(()=>{
    let l=[...evs];
    if(fDisc!=="Todos")l=l.filter(e=>e.disc===fDisc);
    if(fCountry!=="Todos")l=l.filter(e=>e.country===fCountry);
    if(fCities.length)l=l.filter(e=>fCities.includes(e.city));
    if(search.trim())l=l.filter(e=>[e.name,e.city,e.disc,e.desc,e.country].join(" ").toLowerCase().includes(search.toLowerCase()));
    if(onlyFut)l=l.filter(e=>e.date>=today);
    if(onlyNew)l=l.filter(e=>e.ratings.length===0);
    if(fFmts.length)l=l.filter(e=>(e.fmts||[]).some(f=>fFmts.includes(f)));
    l=l.filter(e=>e.price<=maxP);
    if(sort==="rating")l.sort((a,b)=>overall(b.ratings)-overall(a.ratings));
    else if(sort==="price")l.sort((a,b)=>a.price-b.price);
    else l.sort((a,b)=>{const d=boost(b)-boost(a);return d!==0?d:a.date.localeCompare(b.date);});
    return l;
  },[evs,fDisc,fCountry,fCities,search,onlyFut,onlyNew,fFmts,maxP,sort,boost]);
  const upcoming=useMemo(()=>[...evs].filter(e=>e.city!=="Online"&&e.date>=today).sort((a,b)=>{const d=boost(b)-boost(a);return d!==0?d:a.date.localeCompare(b.date);}).slice(0,8),[evs,today]);
  const ranked=useMemo(()=>{let l=evs.filter(e=>e.ratings.length>0);if(rkDisc!=="Todos")l=l.filter(e=>e.disc===rkDisc);if(rkFmts.length)l=l.filter(e=>(e.fmts||[]).some(f=>rkFmts.includes(f)));return l.sort((a,b)=>overall(b.ratings)-overall(a.ratings));},[evs,rkDisc,rkFmts]);
  const cmpEvs=useMemo(()=>cmpIds.map(id=>evs.find(e=>e.id===id)).filter(Boolean),[cmpIds,evs]);
  const clr=()=>{setFDisc("Todos");setFCountry("Todos");setFCities([]);setSearch("");setSort("date");setMaxP(500);setOnlyFut(false);setOnlyNew(false);setFFmts([]);};
  const login=async()=>{setAErr("");try{await signInWithEmailAndPassword(auth,aF.u,aF.p);setView("list");setAF({u:"",name:"",p:"",p2:""});}catch(e){setAErr("Email o contraseña incorrectos");}};
  const reg=async()=>{setAErr("");if(!aF.u||!aF.name||!aF.p)return setAErr("Rellena todos los campos obligatorios");if(aF.p!==aF.p2)return setAErr("Las contraseñas no coinciden");if(aF.p.length<8)return setAErr("Mínimo 8 caracteres");if(!/[A-Z]/.test(aF.p))return setAErr("Debe contener al menos una mayúscula");if(!/[0-9]/.test(aF.p))return setAErr("Debe contener al menos un número");try{const cred=await createUserWithEmailAndPassword(auth,aF.u,aF.p);await updateProfile(cred.user,{displayName:aF.name});setAOk(`Bienvenido/a, ${aF.name}`);setTimeout(()=>{setAOk("");setView("list");},2000);setAF({u:"",name:"",p:"",p2:""});}catch(e){if(e.code==="auth/email-already-in-use")setAErr("Email ya registrado");else setAErr("Error al crear cuenta");}};
  const rate=async(ev)=>{setRErr("");if(!me)return setRErr("Inicia sesión");if(SCORE_KEYS.some(k=>!rSc[k]))return setRErr("Puntua todas las categorias");if(ev.ratings&&ev.ratings.find(r=>r.user===me.u))return setRErr("Ya has valorado");const nr={user:me.u,userName:me.name,date:today,scores:{...rSc},comment:rCom};const updated={...ev,ratings:[...(ev.ratings||[]),nr]};await updateDoc(doc(db,"events",String(ev.id)),{ratings:updated.ratings});setSel(updated);setRSc({precio:0,dificultad:0,organizacion:0,ambiente:0,categorias:0});setRCom("");};
  const deleteRate=async(ev)=>{
    if(!me)return;
    const updated={...ev,ratings:(ev.ratings||[]).filter(r=>r.user!==me.u)};
    await updateDoc(doc(db,"events",String(ev.id)),{ratings:updated.ratings});
  };
  const tog=async(id)=>{if(!me)return;const ev=evs.find(e=>e.id===id);if(!ev)return;const att2=ev.attendance||[];const updated=att2.includes(me.u)?att2.filter(u=>u!==me.u):[...att2,me.u];await updateDoc(doc(db,"events",String(id)),{attendance:updated});};
  const addEv=async()=>{setEvErr("");if(!nEv.name||!nEv.city||!nEv.date)return setEvErr("Nombre, ciudad y fecha obligatorios");const c=PC[nEv.prov]||{lat:40.42,lon:-3.70};const newEvent={...nEv,id:Date.now(),price:Number(nEv.price)||0,ratings:[],attendance:[],lat:c.lat,lon:c.lon,feat:false,verified:false};await setDoc(doc(db,"events",String(newEvent.id)),newEvent);setNEv({name:"",disc:"CrossFit",city:"",prov:"Madrid",country:"España",date:"",price:"",desc:"",url:"",fmts:[],logo:null});setEvOk("Evento anadido");setTimeout(()=>{setEvOk("");setView("list");},2000);};

  const BT=(v)=>({background:v==="p"?"#FF6500":v==="d"?"#EF5350":v==="s"?"#4CAF50":"#242424",color:"#fff",border:"none",padding:"8px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600});
  const PL=(a)=>({background:a?"#FF6500":"#1a1a1a",color:a?"#fff":"#777",border:`1px solid ${a?"#FF6500":"rgba(255,255,255,0.08)"}`,padding:"4px 9px",borderRadius:20,fontSize:12,cursor:"pointer"});
  const IN={width:"100%",padding:"8px 11px",marginBottom:9};
  const CRD={};
  const TABS=[{id:"list",l:"Eventos"},{id:"map",l:"Mapa"},{id:"cal",l:"Calendario"},{id:"rnk",l:"Ranking"},{id:"cmp",l:"Comparar"},{id:"add",l:"+ Anadir"},...(me?[{id:"prof",l:me.name}]:[{id:"auth",l:"Entrar"}])];

  const listWithAds=useMemo(()=>{if(!isMobile)return filtered.map(ev=>({type:"ev",ev}));const r=[];filtered.forEach((ev,i)=>{r.push({type:"ev",ev});if((i+1)%4===0&&i<filtered.length-1)r.push({type:"ad"});});return r;},[filtered,isMobile]);

  if(loading)return<div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{width:36,height:36,border:"3px solid #222",borderTopColor:"#FF6500",borderRadius:"50%",animation:"spin 1s linear infinite"}}/><span style={{color:"#444",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>CARGANDO...</span></div>;
  return<div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column"}}>
    {showContact&&<ContactForm onClose={()=>setShowContact(false)}/>}
    {mapPopup&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setMapPopup(null)}>
      <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:20,maxWidth:480,width:"100%",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,textTransform:"uppercase"}}>Eventos en esta zona</div>
          <button onClick={()=>setMapPopup(null)} style={{background:"none",border:"none",color:"#555",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {mapPopup.events.length===0?<div style={{color:"#555",fontSize:13,textAlign:"center",padding:"20px 0"}}>No hay eventos en esta zona</div>:
        mapPopup.events.map(ev=>{const oa=overall(ev.ratings);return<div key={ev.id} onClick={()=>{setSel(ev);setView("det");setMapPopup(null);}} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 14px",marginBottom:8,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}}>
          <EventLogo ev={ev} size={36}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:4,marginBottom:2,flexWrap:"wrap"}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,textTransform:"uppercase"}}>{ev.name}</div>
            <div style={{fontSize:11,color:"#888"}}>{ev.city} · {fd(ev.date)} · {ev.price===0?"Gratis":`${ev.price}€`}</div>
          </div>
          {oa>0&&<div style={{textAlign:"center",minWidth:36}}><div style={{fontSize:16,fontWeight:900,color:"#FF6500",fontFamily:"'Barlow Condensed',sans-serif"}}>{f1(oa)}</div><Stars n={oa} sz={8}/></div>}
        </div>;})}
      </div>
    </div>}
    {loginHint&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1a1a1a",border:"1px solid #FF6500",borderRadius:10,padding:"12px 20px",zIndex:9999,display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>  <span style={{fontSize:20}}>🔒</span><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"#fff"}}>Inicia sesión para continuar</div><div style={{fontSize:11,color:"#888"}}>Necesitas una cuenta para guardar eventos</div></div><button onClick={()=>{setLoginHint(false);setView("auth");}} style={{background:"#FF6500",color:"#fff",border:"none",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:8}}>Entrar</button><button onClick={()=>setLoginHint(false)} style={{background:"none",border:"none",color:"#555",fontSize:16,cursor:"pointer"}}>✕</button></div>}
    {showAdmin&&<AdminPanel evs={evs} setEvs={setEvs} onClose={()=>setShowAdmin(false)} sponsors={sponsors} setSponsors={setSponsors}/>}

    <header style={{background:"#0d0d0d",borderBottom:"1px solid #1e1e1e",padding:isMobile?"0 8px":"0 20px",height:isMobile?50:62,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,flexShrink:0}}>
      <div style={{display:"flex",flexDirection:"column",lineHeight:1,position:isMobile?"static":"absolute",left:isMobile?"auto":"50%",transform:isMobile?"none":"translateX(-50%)",alignItems:"center",flex:isMobile?1:0}}><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?16:24,fontWeight:900,letterSpacing:isMobile?1:2,textTransform:"uppercase"}}>FIT<span style={{color:"#FF6500"}}>EVENTS</span> WORLD</span><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:isMobile?8:10,letterSpacing:isMobile?1:3,color:"#666",textTransform:"uppercase",marginTop:2,whiteSpace:"nowrap"}}>DESCUBRE · COMPARA · COMPITE</span></div>
      <div style={{display:"flex",gap:7,alignItems:"center",marginLeft:"auto"}}>
        {!isMobile&&<button onClick={()=>setShowContact(true)} style={{background:"rgba(0,210,100,0.15)",color:"#00D264",border:"1px solid rgba(0,210,100,0.35)",padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:700}}>✓ Verificar evento</button>}{installPrompt&&<button onClick={()=>{installPrompt.prompt();installPrompt.userChoice.then(()=>setInstallPrompt(null));}} style={{background:"rgba(77,166,255,0.15)",color:"#4DA6FF",border:"1px solid rgba(77,166,255,0.35)",padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:700}}>📲 Instalar app</button>}
        {me&&!isMobile&&<span style={{fontSize:11,color:"#777"}}>Hola, <strong style={{color:"#FF6500"}}>{me.name}</strong></span>}
        {isAdmin&&<button onClick={()=>setShowAdmin(true)} style={{background:"none",border:"none",color:"#888",fontSize:20,padding:"2px 5px"}} title="Admin">⚙</button>}
      </div>
    </header>
    <nav style={{background:"#0d0d0d",borderBottom:"1px solid #1e1e1e",padding:"0 10px",display:"flex",overflowX:"auto",flexShrink:0,justifyContent:"center",scrollbarWidth:"none"}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setView(t.id)} style={{background:"transparent",color:(view===t.id||(view==="det"&&t.id==="list"))?"#fff":"#999",border:"none",padding:isMobile?"8px 10px":"11px 16px",borderBottom:(view===t.id||(view==="det"&&t.id==="list"))?"2px solid #FF6500":"2px solid transparent",borderRadius:0,cursor:"pointer",whiteSpace:"nowrap",fontSize:isMobile?12:15,fontWeight:700,letterSpacing:0.5,fontFamily:"Barlow Condensed,sans-serif"}}>{t.id==="prof"?<span><span style={{color:"#4DA6FF"}}>👤</span><span style={{color:(view==="prof")?"#fff":"#999"}}> {t.l}</span></span>:t.l}</button>)}
    </nav>
    <div style={{display:"flex",flex:1}}>
{view!=="cal"&&<div style={{width:isMobile?0:140,flexShrink:0,padding:isMobile?"0":"16px 10px",background:"#080808",overflow:"hidden"}}><div style={{background:"#111",border:"1px dashed #1e1e1e",borderRadius:10,height:600,display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",top:80}}><span style={{fontSize:9,color:"#2a2a2a",letterSpacing:2,textTransform:"uppercase",writingMode:"vertical-rl"}}>Publicidad</span></div></div>}      <main style={{flex:1,padding:isMobile?"10px 10px":"16px 20px",minWidth:0}}>

      {view==="list"&&<div>
          {fCities.length>0&&<div style={{background:"rgba(255,107,43,0.08)",border:"1px solid rgba(255,107,43,0.2)",borderRadius:7,padding:"5px 11px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}>
          <span>Filtrando: <strong>{fCities.join(", ")}</strong></span>
          <button onClick={()=>setFCities([])} style={{...BT(""),padding:"1px 7px",fontSize:11}}>✕</button>
        </div>}
        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{display:"flex",flexDirection:"column",gap:3,flex:isMobile?"0 0 100%":"1 1 180px",width:isMobile?"100%":"auto"}}><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:"#888",textTransform:"uppercase"}}>Buscar evento</span><div style={{position:"relative"}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:12}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, ciudad..." style={{...IN,paddingLeft:28,marginBottom:0}}/></div></div>
          <div style={{display:"flex",flexDirection:"column",gap:3,flex:isMobile?"1":"none"}}><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:"#888",textTransform:"uppercase"}}>Disciplina</span><select value={fDisc} onChange={e=>setFDisc(e.target.value)} style={{padding:isMobile?"6px 4px":"8px 10px",minWidth:isMobile?80:120,fontSize:isMobile?11:13}}>{DISCIPLINES.map(d=><option key={d}>{d}</option>)}</select></div>
          <div style={{display:"flex",flexDirection:"column",gap:3,flex:isMobile?"1":"none"}}><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:"#888",textTransform:"uppercase"}}>País</span><select value={fCountry} onChange={e=>{setFCountry(e.target.value);setFCities([]);}} style={{padding:isMobile?"6px 4px":"8px 10px",minWidth:isMobile?80:100,fontSize:isMobile?11:13}}>{countries.map(c=><option key={c}>{c}</option>)}</select></div>
          <div style={{display:"flex",flexDirection:"column",gap:3,flex:isMobile?"1":"none"}}><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:"#888",textTransform:"uppercase"}}>Ordenar por</span><select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:isMobile?"6px 4px":"8px 10px",minWidth:isMobile?90:110,fontSize:isMobile?11:13}}><option value="date">📅 Fecha</option><option value="rating">⭐ Valoración</option><option value="price">💶 Precio</option></select></div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:6,alignItems:"center"}}>
          <button onClick={()=>setShowAdv(x=>!x)} style={{...BT(""),padding:"3px 9px",fontSize:11}}>{showAdv?"▲":"▼"} Filtros</button>
          <button onClick={clr} style={{...BT(""),padding:"3px 9px",fontSize:11}}>Limpiar</button>
          <button onClick={()=>setOnlyFut(x=>!x)} style={{background:onlyFut?"#FF6500":"#242424",color:"#fff",border:onlyFut?"1px solid #FF6500":"1px solid #333",padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:onlyFut?700:400,cursor:"pointer"}}>{onlyFut?"📅 Solo futuros":"📅 Todos"}</button>
          <span style={{fontSize:11,color:"#444",marginLeft:"auto"}}><strong style={{color:"#FF6500"}}>{filtered.length}</strong> eventos</span>
        </div>
        {showAdv&&<div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:11,marginBottom:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:7}}>
            <label style={{fontSize:11,color:"#888"}}>Max: <strong style={{color:"#FF6500"}}>{maxP}EUR</strong><input type="range" min={0} max={500} value={maxP} onChange={e=>setMaxP(Number(e.target.value))} style={{width:"100%",marginTop:3,accentColor:"#FF6500"}}/></label>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <label style={{fontSize:11,color:"#888",display:"flex",gap:5,cursor:"pointer"}}><input type="checkbox" checked={onlyNew} onChange={e=>setOnlyNew(e.target.checked)} style={{accentColor:"#FF6500"}}/>Sin valorar</label>
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{FORMATS.map(f=><button key={f} onClick={()=>setFFmts(x=>x.includes(f)?x.filter(y=>y!==f):[...x,f])} style={PL(fFmts.includes(f))}>{f}</button>)}</div>
        </div>}
        {isMobile&&<div style={{background:"#111",border:"1px dashed #2a2a2a",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",minHeight:60}}><span style={{fontSize:9,color:"#333",letterSpacing:2,textTransform:"uppercase"}}>Publicidad</span></div>}{!me&&<div style={{background:"linear-gradient(135deg,rgba(255,107,43,0.12),rgba(255,107,43,0.05))",border:"1px solid rgba(255,107,43,0.25)",borderRadius:12,padding:"16px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}><div style={{fontSize:28,flexShrink:0}}>🏆</div><div style={{flex:1,minWidth:180}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:"#fff",textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Regístrate gratis para valorar eventos</div><div style={{fontSize:12,color:"#888"}}>+{evs.length} eventos · Descuentos exclusivos de eventos y sponsors · Guarda tus favoritos</div></div><div style={{display:"flex",gap:8,flexShrink:0}}><button onClick={()=>setView("auth")} style={{background:"#FF6500",color:"#fff",border:"none",padding:"8px 18px",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer"}}>Unirme gratis →</button></div></div>}{listWithAds.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"#444"}}>Sin resultados</div>:
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>{listWithAds.map((item,idx)=>{if(item.type==="ad")return<div key={"ad"+idx} style={{background:"#111",border:"1px dashed #2a2a2a",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:60,gridColumn:"1/-1"}}><span style={{fontSize:9,color:"#333",letterSpacing:2,textTransform:"uppercase"}}>Publicidad</span></div>;

          const ev=item.ev,oa=overall(ev.ratings),al=(ev.attendance||[]),ia=me&&al.includes(me.u),dc=DISC_COLORS[ev.disc]||"#555";
          const borderColor=ev.verified?"#4DA6FF":ev.feat?"#FFB300":dc;
          return<div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderTop:`3px solid ${borderColor}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s",display:"flex",flexDirection:"column"}} onClick={()=>{setSel(ev);setView("det");}}>
            <div style={{padding:"14px 14px 10px",borderBottom:"1px solid #222"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                <EventLogo ev={ev} size={52}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge disc={ev.disc}/>
                    {ev.verified&&<VBadge sm/>}
                    {ev.feat&&!ev.verified&&<FBadge sm/>}
                  </div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,textTransform:"uppercase",letterSpacing:0.5,color:"#fff",lineHeight:1.1}}>{ev.name}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(ev.fmts||[]).map(f=><span key={f} style={{fontSize:10,color:"#888",background:"#252525",padding:"2px 8px",borderRadius:10,border:"1px solid #333"}}>{f}</span>)}</div>
            </div>
            <div style={{padding:"10px 14px",flex:1,display:"flex",flexDirection:"column",gap:5}}>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:"#ccc"}}><span style={{color:borderColor}}>📍</span>{ev.city}, {ev.country}</div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:"#ccc"}}><span style={{color:borderColor}}>📅</span>{fd(ev.date)}</div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:ev.price===0?"#4CAF50":"#ccc",fontWeight:ev.price===0?700:400}}><span>💶</span>{ev.price===0?"GRATIS":`${ev.price} €`}</div>
            </div>
            <div style={{padding:"8px 14px",borderTop:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{fontSize:26,fontWeight:900,color:oa>0?"#FF6500":"#333",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{oa>0?f1(oa):"—"}</div>
                <div><Stars n={oa} sz={10}/><div style={{fontSize:10,color:"#555",marginTop:1}}>{ev.ratings.length} op.</div></div>
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                {al.length>0&&<span style={{fontSize:11,color:"#4CAF50"}}>✓{al.length}</span>}
                <button onClick={e=>{e.stopPropagation();if(!me){setLoginHint(true);setTimeout(()=>setLoginHint(false),3000);return;}tog(ev.id);}} style={{fontSize:15,background:"none",border:"none",opacity:ia?1:0.4,padding:0}}>{ia?"💚":"🤍"}</button>
                <button onClick={e=>{e.stopPropagation();setCmpIds(x=>x.includes(ev.id)?x.filter(i=>i!==ev.id):[...x.slice(-1),ev.id]);setView("cmp");}} style={{fontSize:10,background:cmpIds.includes(ev.id)?"rgba(255,100,0,0.15)":"rgba(255,255,255,0.05)",border:cmpIds.includes(ev.id)?"1px solid #FF6500":"1px solid #2a2a2a",borderRadius:5,padding:"3px 6px",color:cmpIds.includes(ev.id)?"#FF6500":"#555"}}>⚖</button>
              </div>
            </div>
          </div>;
        })}</div>}
      </div>}

      {view==="det"&&sel&&(()=>{
        const ev=evs.find(e=>e.id===sel.id)||sel,oa=overall(ev.ratings),al=(ev.attendance||[]),ia=me&&al.includes(me.u),hasR=me&&ev.ratings.find(r=>r.user===me.u),dc=DISC_COLORS[ev.disc]||"#555";
        return<div>
          <button onClick={()=>setView("list")} style={{...BT(""),marginBottom:11,padding:"4px 10px",fontSize:12}}>Volver</button>
          <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(135deg,${ev.verified?"#4DA6FF":dc}15,#0f0f0f)`,borderBottom:`1px solid ${ev.verified?"#4DA6FF":dc}28`,padding:"15px 17px"}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"space-between"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <EventLogo ev={ev} size={52}/>
                  <div>
                  <div style={{display:"flex",gap:4,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge disc={ev.disc}/>{ev.verified&&<VBadge/>}{ev.feat&&<FBadge/>}
                    {(ev.fmts||[]).map(f=><span key={f} style={{fontSize:10,color:"#666",background:"rgba(0,0,0,0.4)",padding:"2px 6px",borderRadius:3,border:"1px solid #2a2a2a"}}>{f}</span>)}
                  </div>
                  <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:21,fontWeight:800,marginBottom:4}}>{ev.name}</h2>
                  <div style={{fontSize:12,color:"#888",display:"flex",gap:9,flexWrap:"wrap"}}><span>{ev.city}, {ev.country}</span><span>{fd(ev.date)}</span><span>{ev.price===0?"Gratis":`${ev.price}EUR`}</span></div>
                  {ev.verified&&<div style={{marginTop:7,fontSize:12,color:"#4DA6FF"}}>✓ Evento verificado por FitEvents World. Informacion oficial y contrastada.</div>}
                  </div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:800,color:oa>0?"#FF6500":"#2a2a2a",fontFamily:"'Barlow Condensed',sans-serif"}}>{oa>0?f1(oa):"—"}</div>
                  <Stars n={oa} sz={13}/><div style={{fontSize:10,color:"#444",marginBottom:7}}>{ev.ratings.length} val.</div>
                  <button onClick={()=>{if(!me){setLoginHint(true);setTimeout(()=>setLoginHint(false),3000);return;}tog(ev.id);}} style={{background:ia?"rgba(76,175,80,0.15)":"rgba(255,255,255,0.06)",color:ia?"#4CAF50":"#fff",border:`1px solid ${ia?"#4CAF50":"rgba(255,255,255,0.15)"}`,padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all 0.2s"}}>{ia?"💚 Asistiré ✓":"🤍 Quiero ir"}</button>
                  {al.length>0&&<div style={{fontSize:10,color:"#4CAF50",marginTop:3}}>{al.length} personas</div>}
                </div>
              </div>
              {ev.desc&&<p style={{marginTop:7,fontSize:13,color:"#bbb",lineHeight:1.5}}>{ev.desc}</p>}
              {ev.url&&<a href={ev.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:8,background:"rgba(255,107,43,0.12)",color:"#FF6500",border:"1px solid rgba(255,107,43,0.25)",padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:700,textDecoration:"none"}}>🌐 Web oficial →</a>}{ev.discount&&<div style={{marginTop:8,background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.25)",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><div><div style={{fontSize:11,color:"#4CAF50",fontWeight:700,marginBottom:2}}>🎟️ DESCUENTO EXCLUSIVO FITEVENTS</div><div style={{fontSize:12,color:"#bbb"}}>{ev.discountDesc||"Descuento exclusivo para usuarios de FitEvents World"}</div></div>{me?<button onClick={()=>{navigator.clipboard.writeText(ev.discount);alert(`Código copiado: ${ev.discount}`);}} style={{background:"#4CAF50",color:"#fff",border:"none",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>Copiar código</button>:<button onClick={()=>{setLoginHint(true);setTimeout(()=>setLoginHint(false),3000);}} style={{background:"rgba(76,175,80,0.15)",color:"#4CAF50",border:"1px solid rgba(76,175,80,0.25)",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>🔒 Regístrate para ver</button>}</div>}
            </div>
            {ev.ratings.length>0&&<div style={{padding:"13px 17px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:8}}>Puntuacion media</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 15px"}}>
                {SCORE_KEYS.map(k=><div key={k} style={{marginBottom:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"#888"}}>{SLABELS[k]}</span><span style={{fontSize:11,color:"#FF6500",fontWeight:600}}>{avgS(ev.ratings,k)>0?f1(avgS(ev.ratings,k)):"—"}</span></div>
                  <div style={{background:"#222",borderRadius:4,height:5}}><div style={{width:`${avgS(ev.ratings,k)?avgS(ev.ratings,k)/5*100:0}%`,height:"100%",background:"linear-gradient(90deg,#FF6500,#FF9A5C)",borderRadius:4}}/></div>
                </div>)}
              </div>
            </div>}
            {ev.ratings.length>0&&<div style={{padding:"13px 17px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:8}}>{ev.ratings.length} valoraciones</div>
              {ev.ratings.map((r,i)=><div key={i} style={{background:"#1a1a1a",borderRadius:8,padding:10,marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                  <div style={{width:25,height:25,borderRadius:"50%",background:"#E74C3C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{(r.userName||r.user).charAt(0).toUpperCase()}</div>
                  <div><div style={{fontSize:12,fontWeight:600}}>{r.userName||r.user}</div><div style={{fontSize:10,color:"#444"}}>{fd(r.date)}</div></div>
                  <div style={{marginLeft:"auto"}}><Stars n={overall([r])} sz={10}/></div>
                </div>
                {r.comment&&<p style={{fontSize:12,color:"#bbb",fontStyle:"italic",borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:5,marginTop:3}}>"{r.comment}"</p>}
              </div>)}
            </div>}
            <div style={{padding:"13px 17px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:8}}>Tu valoracion</div>
              {!me?<div style={{background:"rgba(255,107,43,0.07)",border:"1px solid rgba(255,107,43,0.15)",borderRadius:7,padding:11,textAlign:"center"}}>
                <p style={{color:"#888",fontSize:12,marginBottom:7}}>Inicia sesion para valorar</p>
                <button onClick={()=>setView("auth")} style={{...BT("p"),padding:"5px 13px"}}>Iniciar sesión</button>
              </div>:hasR?<div style={{background:"rgba(76,175,80,0.07)",border:"1px solid rgba(76,175,80,0.15)",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:12,color:"#4CAF50",fontWeight:700}}>✓ Ya has valorado este evento</div><div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 11px"}}>{SCORE_KEYS.map(k=>{const r=ev.ratings.find(x=>x.user===me.u);return<div key={k} style={{marginBottom:4}}><div style={{fontSize:11,color:"#888"}}>{SLABELS[k]}: <strong style={{color:"#FF6500"}}>{r?.scores?.[k]||"—"}/5</strong></div>{STOOLTIPS[k]&&<div style={{fontSize:10,color:"#555",fontStyle:"italic"}}>{STOOLTIPS[k]}</div>}</div>;})}</div>
                <button onClick={()=>deleteRate(ev)} style={{background:"rgba(239,83,80,0.12)",color:"#EF5350",border:"1px solid rgba(239,83,80,0.25)",padding:"4px 10px",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer"}}>Eliminar y repetir</button>
              </div>:
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 11px",marginBottom:7}}>
                  {SCORE_KEYS.map(k=><div key={k} style={{marginBottom:4}}>
                    <div style={{marginBottom:4}}><div style={{fontSize:11,color:"#888"}}>{SLABELS[k]}</div>{STOOLTIPS[k]&&<div style={{fontSize:10,color:"#555",fontStyle:"italic",marginTop:1}}>{STOOLTIPS[k]}</div>}</div>
                    <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRSc(x=>({...x,[k]:n}))} style={{width:23,height:23,borderRadius:3,border:"none",background:rSc[k]>=n?"#FF6500":"#222",color:"#fff",fontSize:11,cursor:"pointer"}}>★</button>)}</div>
                  </div>)}
                </div>
                <textarea value={rCom} onChange={e=>setRCom(e.target.value)} placeholder="Comentario..." style={{...IN,height:48,resize:"none"}}/>
                {rErr&&<p style={{color:"#EF5350",fontSize:11,marginBottom:4}}>{rErr}</p>}
                <button onClick={()=>rate(ev)} style={{...BT("p"),padding:"6px 15px"}}>Publicar</button>
              </div>}
            </div>
          </div>
          {!ev.verified&&<div style={{marginTop:10,background:"rgba(77,166,255,0.06)",border:"1px solid rgba(77,166,255,0.15)",borderRadius:8,padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <div><div style={{fontSize:12,fontWeight:600,color:"#4DA6FF",marginBottom:1}}>¿Eres organizador de este evento?</div><div style={{fontSize:11,color:"#777"}}>Verificalo y aumenta su visibilidad en la plataforma.</div></div>
            <button onClick={()=>setShowContact(true)} style={{...BT("p"),padding:"5px 13px",flexShrink:0,fontSize:12}}>Verificar</button>
          </div>}
        </div>;
      })()}

      {view==="map"&&<div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,letterSpacing:1,textTransform:"uppercase"}}>Mapa de eventos</div>
        <MapView events={evs} onCity={c=>{const eventsInArea=evs.filter(e=>c.includes(e.city)&&e.city!=="Online");if(eventsInArea.length===1){setSel(eventsInArea[0]);setView("det");}else{setMapPopup({cities:c,events:eventsInArea});}}}/>
      </div>}

      {view==="upc"&&<div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,letterSpacing:1,textTransform:"uppercase"}}>Proximos eventos</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {upcoming.map(ev=>{
            const dL=Math.ceil((new Date(ev.date)-new Date())/86400000),urg=dL<=30,dc=DISC_COLORS[ev.disc]||"#555";
            const bc=ev.verified?"#4DA6FF":ev.feat?"#FFB300":dc;
            return<div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,padding:16,cursor:"pointer",borderTop:`4px solid ${bc}`}} onClick={()=>{setSel(ev);setView("det");}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}><EventLogo ev={ev} size={36}/><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:urg?"#FF6500":"#4CAF50"}}>{dL<=0?"Hoy":dL===1?"Manana":`${dL}d`}</span></div>
              <div style={{marginBottom:5}}><Badge disc={ev.disc}/>{ev.verified&&<span style={{marginLeft:4}}><VBadge sm/></span>}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,textTransform:"uppercase",marginBottom:4,lineHeight:1.1}}>{ev.name}</div>
              <div style={{fontSize:12,color:"#888",marginBottom:2}}>{fd(ev.date)} · {ev.city}</div>
              <div style={{fontSize:12,color:ev.price===0?"#4CAF50":"#888",fontWeight:ev.price===0?700:400,marginBottom:10}}>{ev.price===0?"GRATIS":`${ev.price} €`}</div>
              <button onClick={e=>{e.stopPropagation();if(!me){setLoginHint(true);setTimeout(()=>setLoginHint(false),3000);return;}tog(ev.id);}} style={{...BT(((ev.attendance||[])).includes(me?.u)?"s":""),padding:"5px 9px",fontSize:11,width:"100%"}}>{((ev.attendance||[])).includes(me?.u)?"Asistire":"Quiero ir"}</button>
            </div>;
          })}
        </div>
      </div>}

      {view==="cal"&&<CalendarView evs={evs} setSel={setSel} setView={setView} isMobile={isMobile}/>}{view==="rnk"&&<div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,letterSpacing:1,textTransform:"uppercase"}}>Ranking</div>
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <select value={rkDisc} onChange={e=>setRkDisc(e.target.value)} style={{padding:"6px 7px"}}>{DISCIPLINES.map(d=><option key={d}>{d}</option>)}</select>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{FORMATS.map(f=><button key={f} onClick={()=>setRkFmts(x=>x.includes(f)?x.filter(y=>y!==f):[...x,f])} style={PL(rkFmts.includes(f))}>{f}</button>)}</div>
          <span style={{fontSize:11,color:"#444",marginLeft:"auto"}}>{ranked.length}</span>
        </div>
        {ranked.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"#333"}}>Sin eventos valorados</div>:
        ranked.map((ev,i)=>{
          const oa=overall(ev.ratings),medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null,dc=DISC_COLORS[ev.disc]||"#555";
          return<div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderLeft:`4px solid ${ev.verified?"#4DA6FF":dc}`,borderRadius:10,display:"flex",alignItems:"center",padding:"14px 16px",gap:14,marginBottom:8,cursor:"pointer"}} onClick={()=>{setSel(ev);setView("det");}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:medal?"#FF6500":"#444",minWidth:28}}>{medal||`#${i+1}`}</div>
            <EventLogo ev={ev} size={36}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:3,marginBottom:3,alignItems:"center"}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,textTransform:"uppercase",lineHeight:1.1}}>{ev.name}</div>
              <div style={{fontSize:11,color:"#666",marginTop:2}}>{ev.city} · {fd(ev.date)}</div>
            </div>
            <div style={{textAlign:"center",minWidth:70,marginLeft:"auto"}}>
              <div style={{fontSize:28,fontWeight:900,color:"#FF6500",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{f1(oa)}</div>
              <Stars n={oa} sz={11}/>
              <div style={{fontSize:10,color:"#555",marginTop:2}}>{ev.ratings.length} val.</div>
            </div>
          </div>;
        })}
      </div>}

      {view==="cmp"&&<CmpView evs={evs} cmpIds={cmpIds} setCmpIds={setCmpIds} cmpEvs={cmpEvs} setSel={setSel} setView={setView}/>}
      {view==="cmp_DISABLED"&&<div>
      </div>}

      {view==="add"&&<div style={{maxWidth:620,margin:"0 auto"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,letterSpacing:1,textTransform:"uppercase"}}>Añadir evento</div>
        {!me?<div style={{textAlign:"center",padding:"40px 0"}}><p style={{color:"#888",marginBottom:11,fontSize:13}}>Inicia sesión para añadir eventos</p><button onClick={()=>setView("auth")} style={{...BT("p"),padding:"6px 13px"}}>Iniciar sesión</button></div>:
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:20}}>
          <input value={nEv.name} onChange={e=>setNEv(x=>({...x,name:e.target.value}))} placeholder="Nombre del evento *" style={IN}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Disciplina</span><select value={nEv.disc} onChange={e=>setNEv(x=>({...x,disc:e.target.value}))} style={IN}>{DISCIPLINES.slice(1).map(d=><option key={d}>{d}</option>)}</select></div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>País</span><select value={nEv.country} onChange={e=>{const isSpain=e.target.value==="España";setNEv(x=>({...x,country:e.target.value,prov:isSpain?"Madrid":e.target.value}));}} style={IN}><option>España</option>{["Portugal","Francia","Alemania","Italia","Reino Unido","Suecia","Noruega","Dinamarca","Finlandia","Irlanda","Paises Bajos","Belgica","Suiza","Austria","Polonia","Republica Checa","Hungria","Grecia","EEUU","Mexico","Brasil","Argentina","Colombia","Australia","Canada","Gibraltar"].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <input value={nEv.city} onChange={e=>setNEv(x=>({...x,city:e.target.value}))} placeholder="Ciudad *" style={IN}/>
            {nEv.country==="España"?<div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Provincia</span><select value={nEv.prov} onChange={e=>setNEv(x=>({...x,prov:e.target.value}))} style={IN}>{["Alava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Baleares","Barcelona","Bizkaia","Cádiz","Cantabria","Castellón","Ciudad Real","Córdoba","Cuenca","Girona","Granada","Guadalajara","Guipuzcoa","Huelva","Huesca","La Rioja","Las Palmas","León","Lleida","Lugo","Madrid","Málaga","Murcia","Navarra","Pontevedra","Salamanca","Sevilla","Tarragona","Tenerife","Toledo","Valencia","Valladolid","Zamora","Zaragoza"].map(p=><option key={p}>{p}</option>)}</select></div>:<input value={nEv.prov} readOnly style={{...IN,color:"#555"}} placeholder="Provincia (país seleccionado)"/>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Fecha *</span><input type="date" value={nEv.date} onChange={e=>setNEv(x=>({...x,date:e.target.value}))} style={IN}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Precio (0 = Gratis)</span><input type="number" value={nEv.price} onChange={e=>setNEv(x=>({...x,price:e.target.value}))} placeholder="€" style={IN}/></div>
          </div>
          <div style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Formato</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{FORMATS.map(f=>{const sel=(nEv.fmts||[]).includes(f);return<button key={f} onClick={()=>setNEv(x=>({...x,fmts:x.fmts.includes(f)?x.fmts.filter(y=>y!==f):[...x.fmts,f]}))} style={{background:sel?"#FF6500":"#222",color:sel?"#fff":"#aaa",border:`1px solid ${sel?"#FF6500":"#333"}`,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:sel?700:400,cursor:"pointer"}}>{f}</button>;})}</div>
          <textarea value={nEv.desc} onChange={e=>setNEv(x=>({...x,desc:e.target.value}))} placeholder="Descripción del evento..." style={{...IN,height:60,resize:"none"}}/>
          <input value={nEv.url||""} onChange={e=>setNEv(x=>({...x,url:e.target.value}))} placeholder="Web del evento (https://...)" style={IN}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Logo del evento (opcional)</div>
            <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",background:"#1a1a1a",border:"1px dashed rgba(255,255,255,0.12)",borderRadius:7,padding:"10px 14px"}}>
              {nEv.logo?<img src={nEv.logo} style={{width:42,height:42,borderRadius:5,objectFit:"cover"}}/>:<div style={{width:42,height:42,borderRadius:5,background:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#444"}}>🖼</div>}
              <div><div style={{fontSize:12,color:"#aaa"}}>{nEv.logo?"Logo cargado — click para cambiar":"Sube el logo o icono del evento"}</div><div style={{fontSize:10,color:"#555"}}>JPG, PNG o SVG · Max 2MB</div></div>
              {nEv.logo&&<button onClick={e=>{e.preventDefault();setNEv(x=>({...x,logo:null}));}} style={{marginLeft:"auto",background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer"}}>✕</button>}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f||f.size>2*1024*1024)return;const b64=await fileToB64(f);setNEv(x=>({...x,logo:b64}));}}/>
            </label>
          </div>
          {evErr&&<p style={{color:"#EF5350",fontSize:12,marginBottom:6}}>{evErr}</p>}
          {evOk&&<div style={{background:"rgba(76,175,80,0.09)",border:"1px solid rgba(76,175,80,0.18)",borderRadius:5,padding:8,marginBottom:8,textAlign:"center",color:"#4CAF50",fontSize:13}}>✓ {evOk}</div>}
          <button onClick={addEv} style={{...BT("p"),width:"100%",padding:"10px 0",fontSize:14}}>Publicar evento</button>
          <div style={{marginTop:10,background:"rgba(77,166,255,0.06)",border:"1px solid rgba(77,166,255,0.12)",borderRadius:6,padding:"8px 12px",fontSize:11,color:"#aaa"}}>
            ¿Quieres mayor visibilidad? <button onClick={()=>setShowContact(true)} style={{background:"none",border:"none",color:"#4DA6FF",cursor:"pointer",fontSize:11,fontWeight:700,padding:0}}>Solicita verificación</button>
          </div>
        </div>}
      </div>}

      {view==="prof"&&me&&<div style={{maxWidth:700,margin:"0 auto"}}>
        {/* Header perfil */}
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"20px 24px",marginBottom:16,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#FF6500,#ff9a5c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>{me.name.charAt(0).toUpperCase()}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,textTransform:"uppercase",marginBottom:2}}>{me.name}</div>
            <div style={{fontSize:12,color:"#888"}}>{me.email}</div>
          </div>
          <div style={{display:"flex",gap:isMobile?8:16,textAlign:"center"}}>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:"#FF6500"}}>{evs.filter(e=>e.ratings.find(r=>r.user===me.u)).length}</div><div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1}}>Valoraciones</div></div>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:"#4CAF50"}}>{evs.filter(e=>((e.attendance||[])).includes(me.u)).length}</div><div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1}}>Quiero ir</div></div>
          </div>
          <button onClick={()=>setView("sponsors")} style={{background:"rgba(76,175,80,0.12)",color:"#4CAF50",border:"1px solid rgba(76,175,80,0.25)",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>🎟️ Descuentos</button><button onClick={()=>{signOut(auth);setMe(null);setView("list");}} style={{background:"rgba(239,83,80,0.12)",color:"#EF5350",border:"1px solid rgba(239,83,80,0.25)",padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>Cerrar sesión</button>
        </div>
        {/* Mis valoraciones */}
        {evs.filter(e=>e.ratings.find(r=>r.user===me.u)).length>0?<div style={{marginBottom:16}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:10,color:"#FF6500"}}>Mis valoraciones</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {evs.filter(e=>e.ratings.find(r=>r.user===me.u)).map(ev=>{const r=ev.ratings.find(x=>x.user===me.u);const oa=overall([r]);return<div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 14px",display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>{setSel(ev);setView("det");}}>
            <EventLogo ev={ev} size={36}/>
            <div style={{flex:1}}><div style={{display:"flex",gap:4,marginBottom:2}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textTransform:"uppercase"}}>{ev.name}</div><div style={{fontSize:11,color:"#888"}}>{ev.city} · {fd(ev.date)}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#FF6500",fontFamily:"'Barlow Condensed',sans-serif"}}>{f1(oa)}</div><Stars n={oa} sz={9}/></div>
          </div>;})}
          </div>
        </div>:<div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"20px",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:13,color:"#555",marginBottom:8}}>Todavía no has valorado ningún evento</div>
          <button onClick={()=>setView("list")} style={{...BT("p"),padding:"5px 14px",fontSize:12}}>Explorar eventos</button><button onClick={()=>setView("sponsors")} style={{...BT(""),padding:"5px 14px",fontSize:12,marginLeft:8}}>🎟️ Ver descuentos</button>
        </div>}
        {/* Quiero asistir */}
        {evs.filter(e=>((e.attendance||[])).includes(me.u)).length>0&&<div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:10,color:"#4CAF50"}}>Quiero asistir</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {evs.filter(e=>((e.attendance||[])).includes(me.u)).map(ev=><div key={ev.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 14px",display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>{setSel(ev);setView("det");}}>
            <EventLogo ev={ev} size={36}/>
            <div style={{flex:1}}><div style={{display:"flex",gap:4,marginBottom:2}}><Badge disc={ev.disc} sm/>{ev.verified&&<VBadge sm/>}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textTransform:"uppercase"}}>{ev.name}</div><div style={{fontSize:11,color:"#888"}}>{ev.city} · {fd(ev.date)} · {ev.price===0?"Gratis":`${ev.price}€`}</div></div>
            <div style={{fontSize:11,color:"#4CAF50",fontWeight:700}}>✓ Apuntado</div>
          </div>)}
          </div>
        </div>}
      </div>}

      {view==="sponsors"&&<div style={{maxWidth:700,margin:"0 auto"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>Descuentos exclusivos</div><div style={{fontSize:13,color:"#888",marginBottom:16}}>Códigos exclusivos para usuarios registrados de FitEvents World</div>{sponsors.filter(s=>!s.deleted).length===0?<div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"40px 20px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>🎟️</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:"#555",marginBottom:6}}>Próximamente descuentos exclusivos</div><div style={{fontSize:13,color:"#444"}}>Estamos cerrando acuerdos con las mejores marcas del sector fitness</div></div>:<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>{sponsors.filter(s=>!s.deleted).map((s,i)=><div key={i} style={{background:`linear-gradient(135deg,${s.color||"#FF6500"}10,#1a1a1a)`,border:`1px solid ${s.color||"#FF6500"}28`,borderRadius:12,padding:"16px 18px"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>{s.logo?<img src={s.logo} style={{width:40,height:40,borderRadius:6,objectFit:"cover"}}/>:<span style={{fontSize:28}}>🏷️</span>}<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:s.color||"#FF6500"}}>{s.brand}</div><div style={{fontSize:11,color:"#888"}}>{s.desc}</div></div></div><div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:10,color:"#555",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Tu código</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:"#fff",letterSpacing:2}}>{s.code}</div></div><button onClick={()=>{navigator.clipboard.writeText(s.code);alert(`Código copiado: ${s.code}`);}} style={{background:s.color||"#FF6500",color:"#fff",border:"none",padding:"6px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>Copiar</button></div><div style={{fontSize:12,color:"#4CAF50",fontWeight:700,marginBottom:8}}>✓ {s.discount}</div>{s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer" style={{color:s.color||"#FF6500",fontSize:11,fontWeight:700,textDecoration:"none"}}>Ir a la tienda →</a>}</div>)}</div>}</div>}{(view==="legal-privacy"||view==="legal-terms"||view==="legal-cookies"||view==="legal-aviso")&&<div style={{maxWidth:720,margin:"0 auto"}}>
  <button onClick={()=>setView("list")} style={{background:"#242424",color:"#fff",border:"none",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:12,marginBottom:16}}>← Volver</button>
  {view==="legal-privacy"&&<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,textTransform:"uppercase",color:"#FF6500"}}>Política de Privacidad</div><p style={{color:"#888",fontSize:12,marginBottom:16}}>Responsable del tratamiento: Luis Castaño Moreno · contacto@fiteventsworld.com</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>FitEvents World recoge únicamente los datos necesarios para el funcionamiento de la plataforma: email y nombre visible al registrarte, y datos de actividad (valoraciones y eventos marcados como "Quiero ir").</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>No cedemos tus datos a terceros ni los usamos para publicidad personalizada. El tratamiento se basa en tu consentimiento (art. 6.1.a RGPD). Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a contacto@fiteventsworld.com.</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>Los datos se almacenan en Firebase (Google LLC). Puedes reclamar ante la AEPD (aepd.es).</p></div>}
  {view==="legal-terms"&&<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,textTransform:"uppercase",color:"#FF6500"}}>Términos y Condiciones</div><p style={{color:"#888",fontSize:12,marginBottom:16}}>Última actualización: Mayo 2026</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>FitEvents World es un directorio informativo de eventos deportivos. No organizamos los eventos listados ni somos responsables de su celebración, cancelación o modificación.</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>Las valoraciones publicadas son responsabilidad del usuario. Nos reservamos el derecho de eliminar contenido ofensivo, falso o no relacionado con el evento.</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>La verificación de eventos es un servicio de visibilidad y no implica garantía alguna por parte de FitEvents World.</p></div>}
  {view==="legal-cookies"&&<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,textTransform:"uppercase",color:"#FF6500"}}>Política de Cookies</div><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>FitEvents World utiliza únicamente cookies técnicas necesarias para el funcionamiento de la plataforma (sesión de usuario). No utilizamos cookies de seguimiento ni publicidad comportamental.</p><div style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 14px",marginBottom:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8,marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:"#FF6500"}}>Cookie</span><span style={{fontSize:11,fontWeight:700,color:"#FF6500"}}>Finalidad</span><span style={{fontSize:11,fontWeight:700,color:"#FF6500"}}>Duración</span></div><div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8}}><span style={{fontSize:12,color:"#bbb"}}>Firebase Auth</span><span style={{fontSize:12,color:"#bbb"}}>Mantener la sesión iniciada</span><span style={{fontSize:12,color:"#bbb"}}>Sesión / 1 año</span></div></div></div>}
  {view==="legal-aviso"&&<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,marginBottom:16,textTransform:"uppercase",color:"#FF6500"}}>Aviso Legal</div><p style={{color:"#888",fontSize:12,marginBottom:16}}>Titular: Luis Castaño Moreno · www.fiteventsworld.com · contacto@fiteventsworld.com</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>FitEvents World es una plataforma informativa de eventos deportivos de fitness competitivo. El titular no organiza los eventos listados ni es responsable de su celebración, cancelación o modificación.</p><p style={{color:"#bbb",fontSize:13,lineHeight:1.7,marginBottom:12}}>Los contenidos del sitio web son propiedad del titular. Los logos e imágenes de eventos pertenecen a sus respectivos organizadores.</p></div>}
</div>}
{view==="auth"&&<div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:17}}>
          <div style={{display:"flex",gap:0,marginBottom:13,background:"#111",borderRadius:7,padding:3}}>
            {["login","register"].map(m=><button key={m} onClick={()=>{setAMode(m);setAErr("");setAOk("");}} style={{flex:1,background:aMode===m?"#FF6500":"transparent",color:aMode===m?"#fff":"#555",border:"none",padding:"5px 0",borderRadius:5,fontSize:12,fontWeight:600}}>{m==="login"?"Iniciar sesión":"Registrarse"}</button>)}
          </div>
          {aOk?<div style={{background:"rgba(76,175,80,0.09)",border:"1px solid rgba(76,175,80,0.18)",borderRadius:8,padding:13,textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>✓</div><div style={{color:"#4CAF50",fontWeight:600}}>Registro completado</div><div style={{color:"#888",fontSize:12,marginTop:3}}>{aOk}</div></div>:
          <div>
            <input value={aF.u} onChange={e=>setAF(x=>({...x,u:e.target.value}))} placeholder="Email *" style={IN}/>
            {aMode==="register"&&<input value={aF.name} onChange={e=>setAF(x=>({...x,name:e.target.value}))} placeholder="Nombre visible *" style={IN}/>}
            <input type="password" value={aF.p} onChange={e=>setAF(x=>({...x,p:e.target.value}))} placeholder="Contraseña *" style={IN}/>
            {aMode==="register"&&<input type="password" value={aF.p2} onChange={e=>setAF(x=>({...x,p2:e.target.value}))} placeholder="Repetir contraseña *" style={IN}/>}
            {aErr&&<p style={{color:"#EF5350",fontSize:11,marginBottom:5}}>{aErr}</p>}
            <button onClick={aMode==="login"?login:reg} style={{...BT("p"),width:"100%",padding:"8px 0",fontSize:13}}>{aMode==="login"?"Iniciar sesión":"Crear cuenta"}</button>
            
          </div>}
        </div>
      </div>}

      </main>
{view!=="cal"&&<div style={{width:isMobile?0:140,flexShrink:0,padding:isMobile?"0":"16px 10px",background:"#080808",overflow:"hidden"}}><div style={{background:"#111",border:"1px dashed #1e1e1e",borderRadius:10,height:600,display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",top:80}}><span style={{fontSize:9,color:"#2a2a2a",letterSpacing:2,textTransform:"uppercase",writingMode:"vertical-rl"}}>Publicidad</span></div></div>}    </div>
    <footer style={{background:"#141414",borderTop:"1px solid rgba(255,255,255,0.04)",padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:"#444"}}>FitEvents World 2026</span><div style={{display:"flex",gap:10,alignItems:"center",marginTop:4,flexWrap:"wrap"}}><button onClick={()=>setView("legal-privacy")} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",padding:0}}>Política de Privacidad</button><span style={{color:"#333",fontSize:11}}>·</span><button onClick={()=>setView("legal-terms")} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",padding:0}}>Términos de Uso</button><span style={{color:"#333",fontSize:11}}>·</span><button onClick={()=>setView("legal-cookies")} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",padding:0}}>Cookies</button><span style={{color:"#333",fontSize:11}}>·</span><button onClick={()=>setView("legal-aviso")} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",padding:0}}>Aviso Legal</button></div>{installPrompt&&<button onClick={()=>{installPrompt.prompt();installPrompt.userChoice.then(()=>setInstallPrompt(null));}} style={{background:"none",border:"none",color:"#4DA6FF",fontSize:11,cursor:"pointer",padding:0,marginTop:4}}>📲 Instalar app</button>}
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={()=>setShowContact(true)} style={{background:"none",border:"none",color:"#FF6500",fontSize:11,fontWeight:700,padding:0}}>✓ Verificar mi evento</button>
        <span style={{color:"#333",fontSize:11}}>·</span>
        <span style={{color:"#444",fontSize:11}}>contacto@fiteventsworld.com</span>
      </div>
    </footer>
  </div>;
}
