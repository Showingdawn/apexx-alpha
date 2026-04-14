"use client";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (!termsAgreed) {
      return toast.error("You must agree to the Terms of Service");
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!");
      window.location.href = "/trade"; 
    } catch (err) {
      toast.error("Signup error: " + err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
      window.location.href = "/trade";
    } catch (err) {
      toast.error("Google sign in failed: " + err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4 relative overflow-hidden py-10">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon-green/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-watermelon-red/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="bg-[#111] p-8 sm:p-10 rounded-3xl border border-gray-800 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join Apex Alpha to start paper trading</p>
        </div>
        
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-transparent hover:bg-gray-100 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="px-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Or Register</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-neon-green text-white transition-colors"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:border-neon-green text-white transition-colors"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:border-neon-green text-white transition-colors"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <input 
               type="checkbox" 
               checked={termsAgreed}
               onChange={(e) => setTermsAgreed(e.target.checked)}
               className="w-4 h-4 rounded appearance-none border border-gray-600 bg-black checked:bg-neon-green checked:border-neon-green transition-colors cursor-pointer shrink-0 flex items-center justify-center after:content-['✓'] after:text-black after:text-xs after:hidden checked:after:block"
            />
            <span className="text-gray-400 text-sm">
              I agree to the <span className="text-neon-green hover:underline">Terms of Service</span> and <span className="text-neon-green hover:underline">Privacy Policy</span>.
            </span>
          </label>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neon-green hover:brightness-110 text-black font-extrabold py-3.5 rounded-xl mt-2 transition-all shadow-[0_0_15px_rgba(46,189,133,0.3)] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Already have an account? <Link href="/login" className="text-neon-green font-semibold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
