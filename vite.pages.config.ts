import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 root:fileURLToPath(new URL('./github-pages',import.meta.url)),
 base:'/pip/',
 publicDir:fileURLToPath(new URL('./public',import.meta.url)),
 plugins:[react()],
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 define:{'import.meta.env.VITE_API_ORIGIN':JSON.stringify(process.env.PIP_API_ORIGIN??'https://sit-time-tracker.nqktri.chatgpt.site')},
 build:{outDir:fileURLToPath(new URL('./pages-dist',import.meta.url)),emptyOutDir:true},
});
