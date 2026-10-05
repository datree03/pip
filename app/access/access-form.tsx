'use client';
import {useState} from 'react';
import {Armchair,LockKeyhole} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {apiFetch,saveAccessResult,appBase} from '@/lib/client-api';
export default function AccessForm({onUnlocked}:{onUnlocked?:()=>void}={}){
 const[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <main className="access-page"><a className="brand" href={appBase}><span className="brand-icon"><Armchair size={24}/></span>P.I.P</a><section className="access-card"><div className="access-lock"><LockKeyhole size={27}/></div><span className="section-label">YOUR SHARED TRACKER</span><h1>A little privacy.</h1><p>Enter the password to open P.I.P.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await apiFetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const data=await r.json() as {error?:string;accessToken?:string;attemptToken?:string};saveAccessResult(data);if(!r.ok)throw new Error(data.error);if(onUnlocked)onUnlocked();else window.location.assign('/');}catch(e){setError((e as Error).message);setBusy(false)}}}><label htmlFor="access-password">Password</label><Input autoFocus id="access-password" type="password" autoComplete="current-password" maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} aria-invalid={!!error} aria-describedby={error?'access-error':undefined}/>{error&&<p className="access-error" id="access-error" role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy?'Opening…':'Open tracker'}</Button></form></section><small className="access-footnote">Small moments, clearly counted.</small></main>;
}
