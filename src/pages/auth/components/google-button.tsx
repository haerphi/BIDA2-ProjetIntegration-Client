import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleButton() {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    // Send the token to your API for validation and user creation/login
    const response = await fetch(`${import.meta.env.VITE_API_URL}/token/google/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await response.json();
    // Handle successful login (e.g., save JWT, redirect)
    console.log(data);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        {/* Your existing login form goes here */}

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
