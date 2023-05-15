import { useAuth } from '@/providers/auth';
import GoogleButton from './GoogleButton';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const auth = useAuth();

  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="sticky top-0 z-40 bg-white w-screen">
        <div className="h-16 border-b border-b-slate-200 w-full flex flex-col items-center">
          <nav className="flex items-center justify-between w-[75vw] mx-auto h-full">
            <a href="#" className="hover:text-slate-600 cursor-pointer">
              Home
            </a>
            {auth.isSignedIn ? (
              <button onClick={() => auth.signOut()}>Sign out</button>
            ) : (
              <>
                <GoogleButton onClick={auth.signInWithGoogle}>
                  Sign in with Google
                </GoogleButton>
              </>
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
