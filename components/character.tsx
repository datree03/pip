'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {assetUrl} from '@/lib/client-api';
import type {Status} from '@/lib/time';
type Activity='away'|'phone'|'working';
type Transition='arrive'|'leave'|'pick-phone'|'resume-work';
type Phase={steps:Transition[];index:number;to:Activity;id:number};
const normalize=(status:Status):Activity=>status==='sitting'?'working':status;
const captions:Record<Activity,string>={away:'BRB, taking a stroll',phone:'Just one more scroll…',working:'Little steps. Good work.'};
const descriptions:Record<Activity,string>={away:'Cute anime person walking',phone:'Cute anime person looking down at a phone with one hand resting on their cheek',working:'Cute anime person typing at a laptop'};
const transitionDescriptions:Record<Transition,string>={arrive:'Walking to the desk, sitting down, and starting work',leave:'Getting up from the desk and walking away','pick-phone':'Putting work aside and picking up the phone','resume-work':'Putting the phone away and returning to typing'};
const loaded=new Map<string,Promise<void>>();
function ready(path:string){if(!loaded.has(path))loaded.set(path,new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>{loaded.delete(path);reject(new Error('Character image unavailable'));};image.src=path;}));return loaded.get(path)!;}
export function transitionSteps(from:Activity,to:Activity):Transition[]{if(from===to)return[];if(to==='away')return['leave'];if(from==='away')return to==='phone'?['arrive','pick-phone']:['arrive'];return to==='phone'?['pick-phone']:['resume-work'];}
export default function Character({status,paused,onToggle}:{status:Status|null;paused:boolean;onToggle:()=>void}){
 const [rendered,setRendered]=useState<Activity>(status?normalize(status):'working');
 const [phase,setPhase]=useState<Phase|null>(null),[reduced,setReduced]=useState(false);
 const previous=useRef<Activity|null>(status?normalize(status):null),version=useRef(0),currentPhase=useRef(phase),pausedRef=useRef(paused);
 currentPhase.current=phase;pausedRef.current=paused;
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');setReduced(media.matches);const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 useEffect(()=>{
  if(!status)return;
  const to=normalize(status),from=previous.current;previous.current=to;
  const id=++version.current;
  if(!from||from===to||reduced||pausedRef.current){setPhase(null);setRendered(to);return;}
  const steps=transitionSteps(from,to);let cancelled=false;
  Promise.all([...steps.map(step=>assetUrl('transitions/'+step+'.png')),assetUrl('animations/'+to+'.png')].map(ready)).then(()=>{if(!cancelled&&version.current===id){setPhase({steps,index:0,to,id});}}).catch(()=>{if(!cancelled&&version.current===id){setPhase(null);setRendered(to);}});
  return()=>{cancelled=true;};
 },[status,reduced]);
 const step=phase?.steps[phase.index],sprite=step?'transitions/'+step+'.png':'animations/'+rendered+'.png';
 function finish(){const current=currentPhase.current;if(!phase||!current||current.id!==phase.id||current.index!==phase.index)return;if(phase.index+1<phase.steps.length)setPhase({...phase,index:phase.index+1});else{setRendered(phase.to);setPhase(null);}}
 return <div className="character-scene"><div className="scene-orbit"/><div role="img" aria-label={step?transitionDescriptions[step]:descriptions[rendered]} className={'character animated-character '+(step?'transitioning':rendered)+(paused?' animation-paused':'')} style={step?{'--sprite-duration':step==='arrive'||step==='leave'?'1.8s':'1.5s'} as React.CSSProperties:undefined}><div className="character-viewport sprite-reveal" key={sprite+String(phase?.id??'idle')}><img className={'character-sheet '+(step?'transition-sheet':'')} src={assetUrl(sprite)} alt="" draggable={false} onAnimationEnd={step?finish:undefined}/></div></div><span className="scene-caption">{step?transitionDescriptions[step]:captions[rendered]}</span><Button className="animation-toggle" variant="ghost" size="icon-sm" aria-label={paused?'Play character animation':'Pause character animation'} aria-pressed={paused} onClick={onToggle}>{paused?<Play size={14}/>:<Pause size={14}/>}</Button></div>;
}
