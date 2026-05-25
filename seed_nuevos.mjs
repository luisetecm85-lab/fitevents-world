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

const NUEVOS_EVENTS = [
  // HYROX NUEVOS
  {id:412,name:"Hyrox Valencia 2026",disc:"Hyrox",city:"Valencia",prov:"Valencia",country:"España",date:"2026-10-16",price:99,fmts:["Individual","Parejas"],desc:"Hyrox Valencia temporada 26/27. Feria de Valencia. Primera edición en la ciudad del Turia.",feat:true,verified:true,ratings:[],attendance:[]},

  // OCR MAYO
  {id:327,name:"Spartan Race Madrid 2026",disc:"OCR",city:"San Agustín del Guadalix",prov:"Madrid",country:"España",date:"2026-05-09",price:75,fmts:["Individual"],desc:"12ª edición de la Spartan Race en Madrid. Sprint, Super y Beast.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:328,name:"Farinato Race León 2026",disc:"OCR",city:"León",prov:"León",country:"España",date:"2026-05-03",price:40,fmts:["Individual"],desc:"Farinato Race en León.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:329,name:"Farinato Race Madrid 2026",disc:"OCR",city:"Alcobendas",prov:"Madrid",country:"España",date:"2026-05-16",price:40,fmts:["Individual"],desc:"Farinato Race en Alcobendas, Madrid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:330,name:"Desafío Sierra de Cádiz 2026",disc:"OCR",city:"Arcos de la Frontera",prov:"Cádiz",country:"España",date:"2026-05-02",price:35,fmts:["Individual"],desc:"Desafío Sierra de Cádiz en Arcos de la Frontera.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:331,name:"Rabiosa Race 2026",disc:"OCR",city:"Marcilla",prov:"Navarra",country:"España",date:"2026-05-09",price:35,fmts:["Individual"],desc:"Rabiosa Race en Marcilla, Navarra.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:332,name:"Edelweiss Race 2026",disc:"OCR",city:"Sabiñánigo",prov:"Huesca",country:"España",date:"2026-05-10",price:35,fmts:["Individual"],desc:"Edelweiss Race en Sabiñánigo, Huesca.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:333,name:"Desafío Costa Blanca Mayo 2026",disc:"OCR",city:"Mutxamel",prov:"Alicante",country:"España",date:"2026-05-24",price:35,fmts:["Individual"],desc:"Desafío Costa Blanca en Mutxamel, Alicante.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:334,name:"Survivor Race Barcelona 2026",disc:"OCR",city:"Barcelona",prov:"Barcelona",country:"España",date:"2026-05-16",price:40,fmts:["Individual"],desc:"Survivor Race en Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:354,name:"San Isidro Xtreme 2026",disc:"OCR",city:"La Puebla de Almoradiel",prov:"Toledo",country:"España",date:"2026-05-02",price:35,fmts:["Individual"],desc:"San Isidro Xtreme en La Puebla de Almoradiel, Toledo.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:355,name:"Desafío Pinar Extremo 2026",disc:"OCR",city:"San Roque",prov:"Cádiz",country:"España",date:"2026-05-03",price:35,fmts:["Individual"],desc:"Desafío Pinar Extremo en San Roque, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:356,name:"Cavernícola Race 2026",disc:"OCR",city:"Barbadás",prov:"Ourense",country:"España",date:"2026-05-09",price:35,fmts:["Individual"],desc:"Cavernícola Race en Barbadás, Ourense.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:357,name:"Estorbo Race Zaragoza 2026",disc:"OCR",city:"La Cartuja Baja",prov:"Zaragoza",country:"España",date:"2026-05-09",price:35,fmts:["Individual"],desc:"Estorbo Race en La Cartuja Baja, Zaragoza.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:358,name:"Salvando Race Villanueva 2026",disc:"OCR",city:"Villanueva de Córdoba",prov:"Córdoba",country:"España",date:"2026-05-10",price:35,fmts:["Individual"],desc:"Salvando Race en Villanueva de Córdoba.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:359,name:"Crazy Run Archena 2026",disc:"OCR",city:"Archena",prov:"Murcia",country:"España",date:"2026-05-10",price:30,fmts:["Individual"],desc:"Crazy Run en Archena, Murcia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:360,name:"Poseidon Race A Coruña 2026",disc:"OCR",city:"Cerceda",prov:"Asturias",country:"España",date:"2026-05-16",price:35,fmts:["Individual"],desc:"Poseidon Race en Cerceda, A Coruña.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:361,name:"Isla Race Baleares 2026",disc:"OCR",city:"Port Adriano",prov:"Baleares",country:"España",date:"2026-05-17",price:35,fmts:["Individual"],desc:"Isla Race en Port Adriano, Islas Baleares.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:362,name:"Calvarian Race Teruel 2026",disc:"OCR",city:"Alcorisa",prov:"Teruel",country:"España",date:"2026-05-23",price:30,fmts:["Individual"],desc:"Calvarian Race en Alcorisa, Teruel.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:363,name:"Desafío de Guerreros Pineda 2026",disc:"OCR",city:"Pineda de Mar",prov:"Barcelona",country:"España",date:"2026-05-24",price:40,fmts:["Individual"],desc:"Desafío de Guerreros en Pineda de Mar, Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:364,name:"Denontzat Race Irún 2026",disc:"OCR",city:"Irun",prov:"Guipuzcoa",country:"España",date:"2026-05-30",price:35,fmts:["Individual"],desc:"Denontzat Race en Irún, Gipuzkoa.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:365,name:"Fan-Pin Race San Fernando 2026",disc:"OCR",city:"San Fernando",prov:"Cádiz",country:"España",date:"2026-05-30",price:30,fmts:["Individual"],desc:"Fan-Pin Race en San Fernando, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:366,name:"Rural Warrior Tobarra 2026",disc:"OCR",city:"Tobarra",prov:"Albacete",country:"España",date:"2026-05-30",price:30,fmts:["Individual"],desc:"Rural Warrior en Tobarra, Albacete.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:367,name:"Faraon Race Navarra 2026",disc:"OCR",city:"Buñuel",prov:"Navarra",country:"España",date:"2026-05-30",price:35,fmts:["Individual"],desc:"Faraon Race en Buñuel, Navarra.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR JUNIO
  {id:335,name:"Spartan Race Andorra 2026",disc:"OCR",city:"Encamp",prov:"Andorra",country:"Andorra",date:"2026-06-06",price:90,fmts:["Individual"],desc:"Spartan Race en Encamp, Andorra. Beast, Super, Sprint y Ultra.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:336,name:"Farinato Race Gijón 2026",disc:"OCR",city:"Gijón",prov:"Asturias",country:"España",date:"2026-06-13",price:40,fmts:["Individual"],desc:"Farinato Race en Gijón, Asturias.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:337,name:"Medieval Xtreme Race Alginet 2026",disc:"OCR",city:"Alginet",prov:"Valencia",country:"España",date:"2026-06-13",price:35,fmts:["Individual"],desc:"Medieval Xtreme Race en Alginet, Valencia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:338,name:"Gladiator Race Pontevedra 2026",disc:"OCR",city:"Pontevedra",prov:"Pontevedra",country:"España",date:"2026-06-06",price:35,fmts:["Individual"],desc:"Gladiator Race en Pontevedra.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:339,name:"Desafío de Guerreros Valencia 2026",disc:"OCR",city:"Valencia",prov:"Valencia",country:"España",date:"2026-06-21",price:40,fmts:["Individual"],desc:"Desafío de Guerreros en Valencia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:340,name:"Legion Race Manresa 2026",disc:"OCR",city:"Manresa",prov:"Barcelona",country:"España",date:"2026-06-13",price:35,fmts:["Individual"],desc:"Legion Race en Manresa, Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:368,name:"Desafío Arcilasis Murcia 2026",disc:"OCR",city:"Archivel",prov:"Murcia",country:"España",date:"2026-06-06",price:30,fmts:["Individual"],desc:"Desafío Arcilasis en Archivel, Murcia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:369,name:"Survivor Race Madrid 2026",disc:"OCR",city:"Madrid",prov:"Madrid",country:"España",date:"2026-06-06",price:40,fmts:["Individual"],desc:"Survivor Race en Madrid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:370,name:"Pinatarius Obstaculum Cursus 2026",disc:"OCR",city:"San Pedro del Pinatar",prov:"Murcia",country:"España",date:"2026-06-06",price:30,fmts:["Individual"],desc:"Pinatarius Obstaculum Cursus en San Pedro del Pinatar, Murcia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:371,name:"1 and 1 Aguas de Teror 2026",disc:"OCR",city:"Teror",prov:"Las Palmas",country:"España",date:"2026-06-13",price:30,fmts:["Individual"],desc:"1 and 1 Aguas de Teror en Teror, Gran Canaria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:372,name:"Wolf Race Caparroso 2026",disc:"OCR",city:"Caparroso",prov:"Navarra",country:"España",date:"2026-06-13",price:35,fmts:["Individual"],desc:"Wolf Race en Caparroso, Navarra.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:373,name:"Unbroken Race Onda 2026",disc:"OCR",city:"Onda",prov:"Castellón",country:"España",date:"2026-06-13",price:35,fmts:["Individual"],desc:"Unbroken Race en Onda, Castellón.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:374,name:"OCR Mencey La Gomera 2026",disc:"OCR",city:"La Gomera",prov:"Tenerife",country:"España",date:"2026-06-13",price:30,fmts:["Individual"],desc:"OCR Mencey en La Gomera, Tenerife.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:375,name:"A Revolta Irmandiña 2026",disc:"OCR",city:"Verín",prov:"Ourense",country:"España",date:"2026-06-14",price:30,fmts:["Individual"],desc:"A Revolta Irmandiña en Verín, Ourense.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:376,name:"Argoños OCR Cantabria 2026",disc:"OCR",city:"Argoños",prov:"Cantabria",country:"España",date:"2026-06-14",price:30,fmts:["Individual"],desc:"Argoños OCR en Argoños, Cantabria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:377,name:"Hard Running Valdetorres 2026",disc:"OCR",city:"Valdetorres de Jarama",prov:"Madrid",country:"España",date:"2026-06-14",price:35,fmts:["Individual"],desc:"Hard Running en Valdetorres de Jarama, Madrid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:378,name:"Samoa Race Granada 2026",disc:"OCR",city:"Cogollos de la Vega",prov:"Granada",country:"España",date:"2026-06-20",price:30,fmts:["Individual"],desc:"Samoa Race en Cogollos de la Vega, Granada.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:379,name:"Othar Race Ciudad Real 2026",disc:"OCR",city:"Cózar",prov:"Ciudad Real",country:"España",date:"2026-06-20",price:30,fmts:["Individual"],desc:"Othar Race en Cózar, Ciudad Real.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:380,name:"Heracles Race Girona 2026",disc:"OCR",city:"Caldes de Malavella",prov:"Girona",country:"España",date:"2026-06-20",price:35,fmts:["Individual"],desc:"Heracles Race en Caldes de Malavella, Girona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:381,name:"Carrera de Combate Valladolid 2026",disc:"OCR",city:"Santovenia de Pisuerga",prov:"Valladolid",country:"España",date:"2026-06-20",price:30,fmts:["Individual"],desc:"Carrera de Combate en Santovenia de Pisuerga, Valladolid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:382,name:"Aguila Race Segovia 2026",disc:"OCR",city:"Aguilafuente",prov:"Segovia",country:"España",date:"2026-06-21",price:30,fmts:["Individual"],desc:"Águila Race en Aguilafuente, Segovia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:383,name:"Invader Race Barcelona 2026",disc:"OCR",city:"Alt Penedès",prov:"Barcelona",country:"España",date:"2026-06-27",price:35,fmts:["Individual"],desc:"Invader Race en Alt Penedès, Barcelona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:384,name:"Zufarian Race Zaragoza 2026",disc:"OCR",city:"Zuera",prov:"Zaragoza",country:"España",date:"2026-06-27",price:30,fmts:["Individual"],desc:"Zufarian Race en Zuera, Zaragoza.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:385,name:"Heroican Race Lugo 2026",disc:"OCR",city:"Ribadeo",prov:"Lugo",country:"España",date:"2026-06-28",price:30,fmts:["Individual"],desc:"Heroican Race en Ribadeo, Lugo.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR JULIO
  {id:341,name:"Desembarco Vikingo Cantabria 2026",disc:"OCR",city:"Colindres",prov:"Cantabria",country:"España",date:"2026-07-11",price:35,fmts:["Individual"],desc:"Desembarco Vikingo en Colindres, Cantabria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:386,name:"Desafio Ilurcis La Rioja 2026",disc:"OCR",city:"Alfaro",prov:"La Rioja",country:"España",date:"2026-07-04",price:30,fmts:["Individual"],desc:"Desafio Ilurcis en Alfaro, La Rioja.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:387,name:"Samurai Xtreme Race A Coruña 2026",disc:"OCR",city:"As Pontes de García Rodríguez",prov:"Asturias",country:"España",date:"2026-07-04",price:35,fmts:["Individual"],desc:"Samurai Xtreme Race en As Pontes de García Rodríguez, A Coruña.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:388,name:"Conquista La Victoria Tenerife 2026",disc:"OCR",city:"La Victoria de Acentejo",prov:"Tenerife",country:"España",date:"2026-07-05",price:30,fmts:["Individual"],desc:"Conquista La Victoria en La Victoria de Acentejo, Tenerife.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:389,name:"Carrera del Barro Cádiz 2026",disc:"OCR",city:"La Barca de la Florida",prov:"Cádiz",country:"España",date:"2026-07-19",price:30,fmts:["Individual"],desc:"Carrera del Barro en La Barca de la Florida, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR AGOSTO
  {id:390,name:"OCR Danger Extreme Fuerteventura 2026",disc:"OCR",city:"Fuerteventura",prov:"Las Palmas",country:"España",date:"2026-08-01",price:35,fmts:["Individual"],desc:"OCR Danger Extreme en Fuerteventura.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:391,name:"Desafio Cantabro Viérnoles 2026",disc:"OCR",city:"Viérnoles",prov:"Cantabria",country:"España",date:"2026-08-01",price:30,fmts:["Individual"],desc:"Desafío Cántabro en Viérnoles, Cantabria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:392,name:"Xtreme Natural Tesorillo 2026",disc:"OCR",city:"San Martín del Tesorillo",prov:"Cádiz",country:"España",date:"2026-08-02",price:30,fmts:["Individual"],desc:"Xtreme Natural Tesorillo en San Martín del Tesorillo, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:393,name:"Patuntos Race Salamanca 2026",disc:"OCR",city:"Ahigal de los Aceiteros",prov:"Salamanca",country:"España",date:"2026-08-15",price:30,fmts:["Individual"],desc:"Patuntos Race en Ahigal de los Aceiteros, Salamanca.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR SEPTIEMBRE
  {id:342,name:"Victoria Race Álava 2026",disc:"OCR",city:"Nanclares de la Oca",prov:"Alava",country:"España",date:"2026-09-12",price:35,fmts:["Individual"],desc:"Victoria Race en Nanclares de la Oca, Álava.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:343,name:"Kong Race Girona 2026",disc:"OCR",city:"Calonge",prov:"Girona",country:"España",date:"2026-09-12",price:35,fmts:["Individual"],desc:"Kong Race en Calonge, Girona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:344,name:"Desafío Costa Blanca Sep 2026",disc:"OCR",city:"Bigastro",prov:"Alicante",country:"España",date:"2026-09-13",price:35,fmts:["Individual"],desc:"Desafío Costa Blanca en Bigastro, Alicante.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:345,name:"Pirates Race Bétera 2026",disc:"OCR",city:"Bétera",prov:"Valencia",country:"España",date:"2026-09-26",price:35,fmts:["Individual"],desc:"Pirates Race en Bétera, Valencia.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:346,name:"Desafío de Guerreros Madrid Sep 2026",disc:"OCR",city:"Madrid",prov:"Madrid",country:"España",date:"2026-09-27",price:40,fmts:["Individual"],desc:"Desafío de Guerreros en Madrid.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:394,name:"Desafio Cantabro Noja 2026",disc:"OCR",city:"Noja",prov:"Cantabria",country:"España",date:"2026-09-06",price:30,fmts:["Individual"],desc:"Desafío Cántabro en Noja, Cantabria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:395,name:"Lobo Race Salas 2026",disc:"OCR",city:"Salas",prov:"Asturias",country:"España",date:"2026-09-06",price:30,fmts:["Individual"],desc:"Lobo Race en Salas, Asturias.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:396,name:"Uros Race Ourense 2026",disc:"OCR",city:"Toén",prov:"Ourense",country:"España",date:"2026-09-13",price:30,fmts:["Individual"],desc:"Uros Race en Toén, Ourense.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:397,name:"Iberus Race Navarra 2026",disc:"OCR",city:"Milagro",prov:"Navarra",country:"España",date:"2026-09-19",price:30,fmts:["Individual"],desc:"Iberus Race en Milagro, Navarra.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:398,name:"Salvaje Race San Fernando 2026",disc:"OCR",city:"San Fernando",prov:"Cádiz",country:"España",date:"2026-09-19",price:30,fmts:["Individual"],desc:"Salvaje Race en San Fernando, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:399,name:"Atlantis Race A Coruña 2026",disc:"OCR",city:"Carballo",prov:"Asturias",country:"España",date:"2026-09-19",price:30,fmts:["Individual"],desc:"Atlantis Race en Carballo, A Coruña.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:400,name:"Adrenaline Race Cádiz 2026",disc:"OCR",city:"Zahara de los Atunes",prov:"Cádiz",country:"España",date:"2026-09-26",price:30,fmts:["Individual"],desc:"Adrenaline Race en Zahara de los Atunes, Cádiz.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:401,name:"Valkiria Race Lugo 2026",disc:"OCR",city:"Barreiros",prov:"Lugo",country:"España",date:"2026-09-26",price:30,fmts:["Individual"],desc:"Valkiria Race en Barreiros, Lugo.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:402,name:"Santuario Race Cáceres 2026",disc:"OCR",city:"Malpartida de Cáceres",prov:"Cáceres",country:"España",date:"2026-09-27",price:30,fmts:["Individual"],desc:"Santuario Race en Malpartida de Cáceres.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR OCTUBRE
  {id:347,name:"Spartan Race Barcelona 2026",disc:"OCR",city:"Santa Susana",prov:"Barcelona",country:"España",date:"2026-10-17",price:75,fmts:["Individual"],desc:"Spartan Race en Santa Susana, Barcelona.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:348,name:"OCR Mencey La Laguna 2026",disc:"OCR",city:"La Laguna",prov:"Tenerife",country:"España",date:"2026-10-10",price:35,fmts:["Individual"],desc:"OCR Mencey en La Laguna, Tenerife.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:349,name:"Medieval Xtreme Race Peñíscola 2026",disc:"OCR",city:"Peñíscola",prov:"Castellón",country:"España",date:"2026-10-25",price:35,fmts:["Individual"],desc:"Medieval Xtreme Race en Peñíscola, Castellón.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:350,name:"Desafío de Guerreros Málaga 2026",disc:"OCR",city:"Rincón de la Victoria",prov:"Málaga",country:"España",date:"2026-10-25",price:40,fmts:["Individual"],desc:"Desafío de Guerreros en Rincón de la Victoria, Málaga.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:403,name:"Lince Extreme Running Huelva 2026",disc:"OCR",city:"Punta Umbría",prov:"Huelva",country:"España",date:"2026-10-03",price:30,fmts:["Individual"],desc:"Lince Extreme Running en Punta Umbría, Huelva.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:404,name:"Valhalla Race Castellón 2026",disc:"OCR",city:"L'Alcora",prov:"Castellón",country:"España",date:"2026-10-03",price:35,fmts:["Individual"],desc:"Valhalla Race en L'Alcora, Castellón.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:405,name:"Hard Running La Carolina 2026",disc:"OCR",city:"La Carolina",prov:"Jaén",country:"España",date:"2026-10-04",price:30,fmts:["Individual"],desc:"Hard Running en La Carolina, Jaén.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:406,name:"Desafío Boot Camp Vigo 2026",disc:"OCR",city:"Vigo",prov:"Pontevedra",country:"España",date:"2026-10-04",price:30,fmts:["Individual"],desc:"Desafío Boot Camp en Vigo, Pontevedra.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:407,name:"Invictus Race Santoña 2026",disc:"OCR",city:"Santoña",prov:"Cantabria",country:"España",date:"2026-10-11",price:35,fmts:["Individual"],desc:"Invictus Race en Santoña, Cantabria.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:408,name:"Gladius Race Navarra 2026",disc:"OCR",city:"Santacara",prov:"Navarra",country:"España",date:"2026-10-17",price:30,fmts:["Individual"],desc:"Gladius Race en Santacara, Navarra.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR NOVIEMBRE
  {id:351,name:"Spartan Race Tenerife 2026",disc:"OCR",city:"Puerto de la Cruz",prov:"Tenerife",country:"España",date:"2026-11-28",price:75,fmts:["Individual"],desc:"Spartan Race en Puerto de la Cruz, Tenerife. Última cita del año.",feat:true,verified:false,ratings:[],attendance:[]},
  {id:352,name:"Monster Race Girona 2026",disc:"OCR",city:"Sant Miquel de Campmajor",prov:"Girona",country:"España",date:"2026-11-08",price:35,fmts:["Individual"],desc:"Monster Race en Sant Miquel de Campmajor, Girona.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:353,name:"Desafío Costa Blanca Nov 2026",disc:"OCR",city:"Mutxamel",prov:"Alicante",country:"España",date:"2026-11-22",price:35,fmts:["Individual"],desc:"Desafío Costa Blanca en Mutxamel, Alicante. Edición noviembre.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:409,name:"OCR Mencey Los Realejos 2026",disc:"OCR",city:"Los Realejos",prov:"Tenerife",country:"España",date:"2026-11-08",price:30,fmts:["Individual"],desc:"OCR Mencey en Los Realejos, Tenerife.",feat:false,verified:false,ratings:[],attendance:[]},
  {id:410,name:"Gollizno Race Granada 2026",disc:"OCR",city:"Olivares",prov:"Granada",country:"España",date:"2026-11-08",price:30,fmts:["Individual"],desc:"Gollizno Race en Olivares, Granada.",feat:false,verified:false,ratings:[],attendance:[]},
  // OCR DICIEMBRE
  {id:411,name:"Bestial Race Las Palmas 2026",disc:"OCR",city:"Arucas",prov:"Las Palmas",country:"España",date:"2026-12-05",price:35,fmts:["Individual"],desc:"Bestial Race en Arucas, Las Palmas.",feat:false,verified:false,ratings:[],attendance:[]},
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log(`Seeding ${NUEVOS_EVENTS.length} events...`);
  const snap = await getDocs(collection(db, 'events'));
  const chunks = [];
  for (let i = 0; i < NUEVOS_EVENTS.length; i += 400) {
    chunks.push(NUEVOS_EVENTS.slice(i, i + 400));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(ev => {
      const existing = snap.docs.find(d => d.id === String(ev.id));
      const merged = { ...ev, ...(existing ? { ratings: existing.data().ratings || [], attendance: existing.data().attendance || [] } : {}) };
      batch.set(doc(db, 'events', String(ev.id)), merged);
    });
    await batch.commit();
    console.log(`Batch of ${chunk.length} events written`);
  }
  console.log(`Done! ${NUEVOS_EVENTS.length} events added.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
