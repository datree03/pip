import { env } from 'cloudflare:workers';
const COOKIE_AGE=7*24*60*60;
const encoder=new TextEncoder();
function config(){const values=env as unknown as Record<string,string|undefined>;if(!values.ACCESS_SIGNING_KEY||!values.ACCESS_PASSWORD_HASH||!values.ACCESS_PASSWORD_SALT)throw new Error('Access configuration unavailable');return{key:values.ACCESS_SIGNING_KEY,hash:values.ACCESS_PASSWORD_HASH,salt:values.ACCESS_PASSWORD_SALT};}
const bytes=(s:string)=>Uint8Array.from(s.match(/.{1,2}/g)??[],c=>parseInt(c,16));
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),c=>c.toString(16).padStart(2,'0')).join('');
async function signingKey(){return crypto.subtle.importKey('raw',encoder.encode(config().key),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function token(purpose:'access'|'attempt'){const payload=`${purpose}.${Date.now()+COOKIE_AGE*1000}`;const signature=hex(await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(payload)));return `${payload}.${signature}`;}
export async function verify(value:string|undefined,purpose:'access'|'attempt'){
 if(!value)return false;const parts=value.split('.');if(parts.length!==3||parts[0]!==purpose||!/^\d+$/.test(parts[1])||! /^[a-f0-9]{64}$/.test(parts[2]))return false;
 const expires=Number(parts[1]);if(expires<=Date.now()||expires>Date.now()+COOKIE_AGE*1000+60000)return false;
 return crypto.subtle.verify('HMAC',await signingKey(),bytes(parts[2]),encoder.encode(`${parts[0]}.${parts[1]}`));
}
export function cookieValue(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1);}
export async function allowed(request:Request){const bearer=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];return verify(bearer??cookieValue(request,'sit_access'),'access');}
export function accessCookie(request:Request,name:string,value:string){const secure=!['localhost','127.0.0.1'].includes(new URL(request.url).hostname);return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_AGE}${secure?'; Secure':''}`;}
export async function matchesPassword(value:string){const c=config();const key=await crypto.subtle.importKey('raw',encoder.encode(value),'PBKDF2',false,['deriveBits']);const result=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(c.salt),iterations:100000,hash:'SHA-256'},key,256));let diff=result.length^c.hash.length;for(let i=0;i<result.length;i++)diff|=result.charCodeAt(i)^(c.hash.charCodeAt(i)||0);return diff===0;}
