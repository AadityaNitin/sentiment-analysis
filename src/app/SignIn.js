// SignIn.js
'use client';

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function SignIn() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={signInWithGoogle}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Continue with Google
      </button>
    </div>
  );
}
