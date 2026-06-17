import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = cookies();
  const session = cookieStore.get('session')?.value;

  if (session) {
    redirect('/feed');
  }

  redirect('/login');
}
