import {pathToFileURL} from 'node:url';

// Fix floors from Node's 2026-10-21 security release (CVE-2026-111497).
const minimums=new Map([[22,[23,4]],[24,[22,1]],[26,[12,1]]]);
export function assertPatchedRuntime(nodeVersion,brotliVersion){
 const [major,minor,patch]=nodeVersion.split('.').map(Number);
 const floor=minimums.get(major);
 if(!/^\d+\.\d+\.\d+$/.test(nodeVersion)||!floor||minor<floor[0]||(minor===floor[0]&&patch<floor[1])){
  throw new Error(`Unsupported Node.js ${nodeVersion}. Use .nvmrc (22.23.4), or patched Node 24.22.1+ / 26.12.1+ on those release lines.`);
 }
 const [brotliMajor,brotliMinor,brotliPatch]=(brotliVersion??'').split('.').map(Number);
 const affected=brotliMajor===1&&((brotliMinor===0&&brotliPatch>=3&&brotliPatch<10)||(brotliMinor===1&&brotliPatch===0)||(brotliMinor===2&&brotliPatch===0));
 if(!/^\d+\.\d+\.\d+$/.test(brotliVersion??'')||affected){
  throw new Error(`Brotli ${brotliVersion??'unknown'} is affected or unverified. Install an official patched Node.js runtime; npm package updates do not replace Node's Brotli library.`);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  assertPatchedRuntime(process.versions.node,process.versions.brotli);
  console.log(`Runtime check passed: Node ${process.version}, Brotli ${process.versions.brotli}`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
