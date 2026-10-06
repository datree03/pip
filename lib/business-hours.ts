import {dayKey,ZONE,type State,type Session} from './time';

export const HOURS_LABEL='9:00 AM–5:30 PM Pacific';
const localClock=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function isQuietHours(now:number){
 const parts=localClock.formatToParts(now);
 const minutes=Number(parts.find(p=>p.type==='hour')!.value)*60+Number(parts.find(p=>p.type==='minute')!.value);
 return minutes<9*60||minutes>=17*60+30;
}
// Convert a local closing time to UTC without assuming a fixed Pacific offset.
export function closingTime(day:string){
 const target=Date.parse(day+'T17:30:00Z');let result=target;
 const local=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){
  const parts=local.formatToParts(result),value=(key:string)=>parts.find(p=>p.type===key)!.value;
  const actual=Date.parse(`${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}Z`);
  result+=target-actual;
 }
 return result;
}
export function automaticEnd(state:State|null,now:number):number|null{
 if(!state||(state.status!=='away'&&state.status!=='phone')||now<state.startedAt)return null;
 // Old off-hours sessions cannot accrue time under the new rule.
 const end=isQuietHours(state.startedAt)?state.startedAt:closingTime(dayKey(state.startedAt));
 return now>=end?end:null;
}
export const automaticSessionId=(state:State)=>`auto:${state.revision}:${state.startedAt}:${state.status}`;
export function projectBusinessHours(state:State|null,sessions:Session[],now:number){
 const end=automaticEnd(state,now);
 if(!state||end===null)return{state,sessions};
 const id=automaticSessionId(state);
 const completed=end>state.startedAt&&!sessions.some(s=>s.id===id)?[{id,status:state.status,start:state.startedAt,end},...sessions]:sessions;
 return{state:{...state,status:'working' as const,startedAt:end},sessions:completed};
}
