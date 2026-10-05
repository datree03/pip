import {getDb} from '@/db';
import {allowed} from '@/lib/access';
import {json,originAllowed,preflight} from '@/lib/api-response';
const statuses=['away','sitting','phone','working'];
export const OPTIONS=preflight;
export async function GET(request:Request){
 try{
 if(!originAllowed(request))return json(request,{error:'Access denied.'},403);
 if(!await allowed(request))return json(request,{error:'Enter the password to access the tracker.'},401);
 const db=getDb();
 await db.prepare("INSERT OR IGNORE INTO tracker (id,status,started_at,revision,hourly_rate_cents) VALUES (1,'working',?,0,2500)").bind(Date.now()).run();
 await db.prepare("UPDATE tracker SET status='working',revision=revision+1 WHERE id=1 AND status='sitting'").run();
 const results=await db.batch([db.prepare('SELECT status, started_at AS startedAt, revision, hourly_rate_cents AS hourlyRate FROM tracker WHERE id=1'),db.prepare("SELECT id,status,start,end FROM sessions WHERE status IN ('away','phone') ORDER BY start DESC")]);
 return json(request,{state:results[0].results[0],sessions:results[1].results,serverNow:Date.now()});
 }catch(e){console.error(e);return json(request,{error:'Unable to load shared tracker. Please try again.'},503);}
}
export async function POST(request:Request){
 try{
 if(!originAllowed(request))return json(request,{error:'Access denied.'},403);
 if(!await allowed(request))return json(request,{error:'Enter the password to access the tracker.'},401);
 const data=await request.json().catch(()=>null) as {action?:unknown;rate?:unknown;status?:unknown;revision?:unknown}|null;
 if(!data||typeof data!=='object')return json(request,{error:'Invalid request.'},400);
 const db=getDb();
 if(data.action==='rate'){
  if(typeof data.rate!=='number'||!Number.isFinite(data.rate)||data.rate<0||data.rate>100000)return json(request,{error:'Enter an hourly rate between $0 and $100,000.'},400);
  await db.prepare('UPDATE tracker SET hourly_rate_cents=? WHERE id=1').bind(Math.round(data.rate*100)).run();return json(request,{ok:true});
 }
 if(data.action!=='status'||typeof data.status!=='string'||!statuses.includes(data.status)||typeof data.revision!=='number'||!Number.isSafeInteger(data.revision))return json(request,{error:'Invalid status update.'},400);
 const status=data.status==='sitting'?'working':data.status;
 const now=Date.now();
 const results=await db.batch([
  db.prepare("INSERT INTO sessions (id,status,start,end) SELECT ?,status,started_at,? FROM tracker WHERE id=1 AND revision=? AND status<>? AND started_at<=? AND status IN ('away','phone')").bind(crypto.randomUUID(),now,data.revision,status,now),
  db.prepare('UPDATE tracker SET status=?,started_at=?,revision=revision+1 WHERE id=1 AND revision=? AND status<>? AND started_at<=?').bind(status,now,data.revision,status,now)
 ]);
 if(!results[1].meta.changes)return json(request,{error:'The shared status changed. Please try again.'},409);
 return json(request,{ok:true,status});
 }catch(e){console.error(e);return json(request,{error:'Unable to save. Please refresh and try again.'},503);}
}
