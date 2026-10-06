import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {Miniflare} from 'miniflare';
const temporary=await mkdtemp(join(tmpdir(),'pip-hours-'));
let worker;
try{
 for(const name of ['time','business-hours','business-hours-server']){
  const source=await readFile(new URL('../lib/'+name+'.ts',import.meta.url),'utf8');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/(time|business-hours)'/g,"from './$1.mjs'");
  await writeFile(join(temporary,name+'.mjs'),output);
 }
 const {isQuietHours,closingTime,automaticEnd,projectBusinessHours}=await import(pathToFileURL(join(temporary,'business-hours.mjs')));
 const {enforceBusinessHours}=await import(pathToFileURL(join(temporary,'business-hours-server.mjs')));
 const {dailyTotals,periodStats}=await import(pathToFileURL(join(temporary,'time.mjs')));
 const at=Date.parse;
 assert.equal(isQuietHours(at('2026-10-05T08:59:59-07:00')),true);
 assert.equal(isQuietHours(at('2026-10-05T09:00:00-07:00')),false);
 assert.equal(isQuietHours(at('2026-10-05T17:29:59-07:00')),false);
 assert.equal(isQuietHours(at('2026-10-05T17:30:00-07:00')),true);
 assert.equal(isQuietHours(at('2026-10-05T23:59:59-07:00')),true);
 assert.equal(isQuietHours(at('2026-10-06T00:00:00-07:00')),true);
 // DST transition days must close at the correct wall time, not midnight plus 17.5 hours.
 assert.equal(closingTime('2026-03-08'),at('2026-03-08T17:30:00-07:00'));
 assert.equal(closingTime('2026-11-01'),at('2026-11-01T17:30:00-08:00'));
 const start=at('2026-10-05T17:00:00-07:00'),end=at('2026-10-05T17:30:00-07:00');
 const state={status:'away',startedAt:start,revision:7,hourlyRate:5000};
 assert.equal(automaticEnd(state,end-1),null);
 assert.equal(automaticEnd(state,end),end);
 assert.equal(automaticEnd(state,at('2026-10-09T10:00:00-07:00')),end);
 assert.equal(automaticEnd({...state,status:'working'},end),null);
 assert.equal(automaticEnd({...state,startedAt:at('2026-10-05T20:00:00-07:00')},at('2026-10-06T10:00:00-07:00')),at('2026-10-05T20:00:00-07:00'));
 for(const status of ['away','phone']){
  const view=projectBusinessHours({...state,status},[],at('2026-10-06T10:00:00-07:00'));
  assert.equal(view.state.status,'working');
  assert.equal(view.sessions[0].end,end);
  const totals=dailyTotals(view.sessions,view.state,at('2026-10-06T10:00:00-07:00'));
  assert.equal(totals['2026-10-05'][status],30*60*1000);
  assert.equal(totals['2026-10-06'],undefined);
  const stats=periodStats(view.sessions,totals,'2026-10-05','2026-10-06',status);
  assert.equal(stats.average,30*60*1000);
  assert.equal(stats.total/3600000*50,25);
 }
 worker=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'business-hours-tests'}});
 const db=await worker.getD1Database('DB');
 const schema=await readFile(new URL('../drizzle/0000_demonic_beast.sql',import.meta.url),'utf8');
 for(const statement of schema.split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run();
 const reset=async(status,startedAt=start)=>{
  await db.batch([db.prepare('DELETE FROM sessions'),db.prepare('DELETE FROM tracker'),db.prepare('INSERT INTO tracker VALUES (1,?,?,7,5000)').bind(status,startedAt)]);
 };
 for(const status of ['away','phone']){
  await reset(status);
  await enforceBusinessHours(db,end-1);
  assert.equal((await db.prepare('SELECT status FROM tracker').first()).status,status);
  // Concurrent viewers must produce exactly one closed session.
  await Promise.all([enforceBusinessHours(db,end),enforceBusinessHours(db,end),enforceBusinessHours(db,end)]);
  await enforceBusinessHours(db,at('2026-10-09T10:00:00-07:00'));
  const stored=await db.prepare('SELECT * FROM tracker').first();
  assert.equal(stored.status,'working');assert.equal(stored.started_at,end);assert.equal(stored.revision,8);assert.equal(stored.hourly_rate_cents,5000);
  const sessions=(await db.prepare('SELECT * FROM sessions').all()).results;
  assert.equal(sessions.length,1);assert.equal(sessions[0].end,end);assert.equal(sessions[0].start,start);assert.equal(sessions[0].status,status);
 }
 await reset('away');
 await enforceBusinessHours(db,at('2026-10-06T09:00:00-07:00'));
 assert.equal((await db.prepare('SELECT end FROM sessions').first()).end,end);
 const overnight=at('2026-10-05T20:00:00-07:00');
 await reset('phone',overnight);
 await enforceBusinessHours(db,at('2026-10-06T09:00:00-07:00'));
 assert.equal((await db.prepare('SELECT status FROM tracker').first()).status,'working');
 assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM sessions').first()).count,0);
 console.log('Business-hours checks passed: boundaries, DST, closed browsers, both activities, costs, and concurrent resets.');
}finally{
 await worker?.dispose();
 await rm(temporary,{recursive:true,force:true});
}
