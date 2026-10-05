import { getDb } from '@/db';
const statuses = ['away','sitting','phone','working'];
export async function GET() {
 try {
 const db=getDb();
 await db.prepare("INSERT OR IGNORE INTO tracker (id,status,started_at,revision,hourly_rate_cents) VALUES (1,'sitting',?,0,2500)").bind(Date.now()).run();
 const results=await db.batch([db.prepare('SELECT status, started_at AS startedAt, revision, hourly_rate_cents AS hourlyRate FROM tracker WHERE id=1'),db.prepare('SELECT id,status,start,end FROM sessions ORDER BY start DESC')]);
 return Response.json({state:results[0].results[0],sessions:results[1].results,serverNow:Date.now()},{headers:{'Cache-Control':'no-store'}});
 } catch(e) { console.error(e); return Response.json({error:'Unable to load shared tracker. Please try again.'},{status:503}); }
}
export async function POST(request:Request) {
 try {
 const data=await request.json() as {action?:unknown;rate?:unknown;status?:unknown;revision?:unknown}; if(!data||typeof data!=='object')return Response.json({error:'Invalid request.'},{status:400}); const db=getDb();
 if (data.action==='rate') {
 if(typeof data.rate!=='number'||!Number.isFinite(data.rate)||data.rate<0||data.rate>100000) return Response.json({error:'Enter an hourly rate between $0 and $100,000.'},{status:400});
 await db.prepare('UPDATE tracker SET hourly_rate_cents=? WHERE id=1').bind(Math.round(data.rate*100)).run(); return Response.json({ok:true});
 }
 if(data.action!=='status'||typeof data.status!=='string'||!statuses.includes(data.status)||typeof data.revision!=='number'||!Number.isSafeInteger(data.revision))return Response.json({error:'Invalid status update.'},{status:400});
 const now=Date.now();
 const results=await db.batch([
 db.prepare('INSERT INTO sessions (id,status,start,end) SELECT ?,status,started_at,? FROM tracker WHERE id=1 AND revision=? AND status<>? AND started_at<=?').bind(crypto.randomUUID(),now,data.revision,data.status,now),
 db.prepare('UPDATE tracker SET status=?,started_at=?,revision=revision+1 WHERE id=1 AND revision=? AND status<>? AND started_at<=?').bind(data.status,now,data.revision,data.status,now)
 ]);
 if(!results[1].meta.changes) return Response.json({error:'The shared status changed. Please try again.'},{status:409});
 return Response.json({ok:true});
 } catch(e) {console.error(e);return Response.json({error:'Unable to save. Your change has not been confirmed; please refresh and try again.'},{status:503});}
}
