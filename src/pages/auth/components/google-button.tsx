import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import type { LoginResponse } from '../../../api/auth.service';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleButton({ handleSuccess }: { handleSuccess: (response: LoginResponse) => void }) {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // Send the token to your API for validation and user creation/login
      const response = await fetch(`${import.meta.env.VITE_API_URL}/token/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data: LoginResponse = await response.json();
      // Handle successful login (e.g., save JWT, redirect)
      handleSuccess(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="google-login-button">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default GoogleButton;
