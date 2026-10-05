import {accessCookie,cookieValue,matchesPassword,token,verify} from '@/lib/access';
import {json,originAllowed,preflight} from '@/lib/api-response';
export const OPTIONS=preflight;
export async function POST(request:Request){
 try{
 if(!originAllowed(request))return json(request,{error:'Access denied.'},403);
 const attempt=request.headers.get('X-PIP-Attempt')??cookieValue(request,'sit_attempt');
 if(!await verify(attempt,'attempt')){
  const attemptToken=await token('attempt');
  return json(request,{error:'Access denied. Please try again.',attemptToken},401,{'Set-Cookie':accessCookie(request,'sit_attempt',attemptToken)});
 }
 const data=await request.json().catch(()=>null) as {password?:unknown}|null;
 if(typeof data?.password!=='string'||data.password.length>128||!await matchesPassword(data.password))return json(request,{error:'Incorrect password. Please try again.'},401);
 const accessToken=await token('access');
 return json(request,{ok:true,accessToken},200,{'Set-Cookie':accessCookie(request,'sit_access',accessToken)});
 }catch(e){console.error(e);return json(request,{error:'Access is temporarily unavailable. Please try again.'},503);}
}
