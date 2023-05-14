import { useAuth } from '@/providers/auth';
import GoogleButton from 'react-google-button';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const auth = useAuth();

  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="sticky top-0 z-40 bg-white w-screen">
        <div className="h-16 border-b border-b-slate-200 py-4">
          <nav className="ml-4 pl-6 flex justify-between">
            <a href="#" className="hover:text-slate-600 cursor-pointer">
              Home
            </a>
            {auth.isSignedIn ? (
              <button onClick={() => auth.signOut()}>Sign out</button>
            ) : (
              <GoogleButton onClick={auth.signInWithGoogle} />
            )}
          </nav>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
