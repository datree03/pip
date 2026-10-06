import {automaticEnd,automaticSessionId} from './business-hours';
import type {State} from './time';

export async function enforceBusinessHours(db:D1Database,now:number){
 const state=await db.prepare('SELECT status, started_at AS startedAt, revision, hourly_rate_cents AS hourlyRate FROM tracker WHERE id=1').first<State>();
 const end=automaticEnd(state,now);
 if(!state||end===null)return;
 const statements=[];
 if(end>state.startedAt)statements.push(db.prepare("INSERT OR IGNORE INTO sessions (id,status,start,end) SELECT ?,status,started_at,? FROM tracker WHERE id=1 AND revision=? AND started_at=? AND status=?").bind(automaticSessionId(state),end,state.revision,state.startedAt,state.status));
 statements.push(db.prepare("UPDATE tracker SET status='working',started_at=?,revision=revision+1 WHERE id=1 AND revision=? AND started_at=? AND status=?").bind(end,state.revision,state.startedAt,state.status));
 // One atomic batch and revision guards prevent duplicate sessions when clients poll together.
 await db.batch(statements);
}
