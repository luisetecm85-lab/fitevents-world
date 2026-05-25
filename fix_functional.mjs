import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVJe1QFCRQDDUBh4Xs4GH27VeyKq3uA0s",
  authDomain: "fitevents-world.firebaseapp.com",
  projectId: "fitevents-world",
  storageBucket: "fitevents-world.firebasestorage.app",
  messagingSenderId: "34401442553",
  appId: "1:34401442553:web:90b99d5cc7c4bbb7956028"
};

async function fix() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'events'));
  const toFix = snap.docs.filter(d => d.data().disc === 'Functional');
  console.log(`Found ${toFix.length} events to fix...`);
  for (const d of toFix) {
    await updateDoc(doc(db, 'events', d.id), { disc: 'Fitness Funcional' });
    console.log(`Fixed: ${d.data().name}`);
  }
  console.log('Done!');
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });