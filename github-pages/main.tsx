import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Tracker from '../app/tracker';
import AccessForm from '../app/access/access-form';
import {apiFetch,clearAccess} from '../lib/client-api';
import '../app/globals.css';
function App(){
 const [ready,setReady]=useState(false),[checking,setChecking]=useState(()=>!!sessionStorage.getItem('pip-access'));
 useEffect(()=>{if(!sessionStorage.getItem('pip-access'))return;let cancelled=false;apiFetch('/api/tracker').then(r=>{if(cancelled)return;if(r.ok)setReady(true);else if(r.status===401)clearAccess();setChecking(false)}).catch(()=>{if(!cancelled)setChecking(false)});return()=>{cancelled=true}},[]);
 if(checking)return <main className="access-page"><div className="brand">P.I.P</div><p role="status">Opening your tracker…</p></main>;
 return ready?<Tracker/>:<AccessForm onUnlocked={()=>setReady(true)}/>;
}
createRoot(document.getElementById('root')!).render(<App/>);
