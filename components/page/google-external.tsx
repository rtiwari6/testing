import { useEffect } from 'react';
import { getAuth, getRedirectResult, GoogleAuthProvider } from '../client'; // Adjust path as needed
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react'; // Or your custom signIn function

const GoogleExternal = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const auth = getAuth();
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          await signIn('credentials', { // Using NextAuth.js
            email: result.user.email as string,
            idToken,
            redirect: false
          });
          
          // Notify opener window and close
          window.opener?.postMessage({ type: 'SIGNIN_SUCCESS' }, window.origin);
          window.close();
          router.push('/'); // Fallback in case window doesn't close
        } else {
          // No result means we need to initiate the redirect
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        }
      } catch (error) {
        console.error("Redirect handling error:", error);
        window.opener?.postMessage({ type: 'SIGNIN_ERROR', error }, window.origin);
        window.close();
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <p>Processing Google sign-in...</p>
    </div>
  );
};

export default GoogleExternal;
