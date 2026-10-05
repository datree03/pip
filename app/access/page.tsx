import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {verify} from '@/lib/access';
import AccessForm from './access-form';
export const dynamic='force-dynamic';
export default async function Access(){
 if(await verify((await cookies()).get('sit_access')?.value,'access'))redirect('/');
 return <AccessForm/>;
}
