import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { authService, type LoginResponse } from '../../../api/auth.service';
import { useState } from 'react';
import { AxiosError } from 'axios';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleButton({ handleSuccess }: { handleSuccess: (response: LoginResponse) => void }) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // Send the token to your API for validation and user creation/login
      const response = await authService.loginGoogle(credentialResponse.credential as string);
      handleSuccess(response);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.detail);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur inattendue s'est produite");
      }
    }
  };

  return (
    <>
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
      {error && <div className="text-danger small mt-1">{error}</div>}
    </>
  );
}

export default GoogleButton;
