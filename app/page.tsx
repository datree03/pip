import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {verify} from '@/lib/access';
import Tracker from './tracker';
export const dynamic='force-dynamic';
export default async function Home(){
 const cookieStore=await cookies();
 if(!await verify(cookieStore.get('sit_access')?.value,'access'))redirect('/access');
 return <Tracker/>;
}
