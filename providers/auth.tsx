import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Auth, Hub } from 'aws-amplify';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthState = {
  user: any;
  sub: string;
  isSignedIn: boolean;
  signInWithGoogle(): void;
  signOut(): void;
};

const AuthStateContext = createContext<AuthState>({} as any);

export const AuthStateProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then((userData) => setUser(userData));
          setIsSignedIn(true);
          break;
        case 'signOut':
          setUser(null);
          setIsSignedIn(false);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then((userData) => setUser(userData));
  }, []);

  async function getUser() {
    const user = await Auth.currentAuthenticatedUser();

    if (user) {
      setIsSignedIn(true);
      return user;
    }
  }

  const signInWithGoogle = () => {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });
  };

  const sub = user?.attributes?.sub || '';

  return (
    <AuthStateContext.Provider
      value={{
        sub,
        user,
        isSignedIn,
        signInWithGoogle,
        signOut: Auth.signOut,
      }}
    >
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuth = () => useContext(AuthStateContext);
