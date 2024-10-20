// src/components/SignIn.js
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../login/firebase";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [signInWithGoogle, user] = useSignInWithGoogle(auth);
  const navigate = useNavigate();

  if (user) {
    navigate("/portfolio");
  }

  return (
    <div className="signin">
      <h1>Sign In</h1>
      <button onClick={() => signInWithGoogle()}>Sign In with Google</button>
    </div>
  );
}

export default SignIn;
