const config=import.meta.env;
export const apiOrigin=(config.VITE_API_ORIGIN as string|undefined)?.replace(/\/$/,'')??'';
export const isGitHubPages=!!apiOrigin;
export const appBase=(config.BASE_URL as string|undefined)??'/';
export const assetUrl=(path:string)=>appBase+path.replace(/^\//,'');
export function clearAccess(){if(isGitHubPages)sessionStorage.removeItem('pip-access');}
export function goToAccess(){clearAccess();if(isGitHubPages)window.location.reload();else window.location.assign('/access');}
export async function apiFetch(path:string,options:RequestInit={}){
 const headers=new Headers(options.headers);
 if(isGitHubPages){const access=sessionStorage.getItem('pip-access');const attempt=localStorage.getItem('pip-attempt');if(access)headers.set('Authorization','Bearer '+access);if(attempt)headers.set('X-PIP-Attempt',attempt);}
 return fetch(apiOrigin+path,{...options,headers,credentials:isGitHubPages?'omit':'same-origin'});
}
export function saveAccessResult(data:{accessToken?:string;attemptToken?:string}){if(!isGitHubPages)return;if(data.attemptToken)localStorage.setItem('pip-attempt',data.attemptToken);if(data.accessToken)sessionStorage.setItem('pip-access',data.accessToken);}
