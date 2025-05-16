import { useEffect } from 'react';
import { getAuth, signInWithRedirect, GoogleAuthProvider } from '../client';

const GoogleExternal = () => {
  useEffect(() => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // Initiate redirect flow
    signInWithRedirect(auth, provider)
      .catch((error) => {
        console.error("Redirect error:", error);
        window.close(); // Close tab if error occurs
      });
  }, []);

  return <div>Redirecting to Google sign-in...</div>;
};

export default GoogleExternal;
