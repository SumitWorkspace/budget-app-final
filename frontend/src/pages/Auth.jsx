import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';
import API from "../api/axios";
import { Activity, Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/api/users/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);

      if (isForgotPassword) {
        if (!form.email) return setError("Please enter your email");
        const res = await API.post("/api/users/forgot-password", { email: form.email });
        setSuccessMsg(res.data.message || "Reset link sent!");
        setForm({ name: "", email: "", password: "" });
      } else if (isSignup) {
        if (!form.name || !form.email || !form.password) return setError("Please fill all fields");
        await API.post("/api/users/register", form);
        setIsSignup(false);
        setSuccessMsg("Account created! Please log in.");
        setForm({ name: "", email: "", password: "" }); // Reset for login
      } else {
        if (!form.email || !form.password) return setError("Please fill all fields");
        const res = await API.post("/api/users/login", {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <div className="w-full max-w-5xl z-10 p-6 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Brand Story */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center md:text-left space-y-6"
        >
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4">
            <Activity className="text-emerald-400" size={20} />
            <span className="text-sm font-semibold tracking-wide text-white uppercase">SmartBudget Pro</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Wealth building, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              simplified.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto md:mx-0">
            Join the next generation of personal finance. Track, budget, and grow your net worth with AI-powered insights.
          </p>
          <div className="hidden md:flex items-center gap-6 pt-8 text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" /> Bank-grade Security
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-indigo-400" /> Real-time Sync
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          {/* Glass Card */}
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden">
            {/* Glossy highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isForgotPassword ? "Reset password" : isSignup ? "Create account" : "Welcome back"}
                </h2>
                <p className="text-slate-400">
                  {isForgotPassword ? "Enter your email to receive a reset link." : isSignup ? "Start your financial journey today." : "Enter your credentials to access your dashboard."}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {!isForgotPassword && isSignup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      className="space-y-1"
                    >
                      <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {!isForgotPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        {!isSignup && (
                          <button 
                            type="button" 
                            onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMsg(""); }}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center"
                    >
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3.5 rounded-xl font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isForgotPassword ? "Send Reset Link" : isSignup ? "Create Account" : "Sign In"}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </>
                  )}
                </button>
              </form>

              {!isForgotPassword && (
                <>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or continue with</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google Authentication failed")}
                      text={isSignup ? "signup_with" : "signin_with"}
                      theme="filled_black"
                      shape="pill"
                      width="320"
                    />
                  </div>
                </>
              )}

              <div className="mt-8 text-center text-sm text-slate-400">
                {isForgotPassword ? (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMsg(""); }}
                      className="text-white font-semibold hover:text-emerald-400 transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                ) : isSignup ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setIsSignup(false); setError(""); setSuccessMsg(""); setForm({name:"", email:"", password:""}); }}
                      className="text-white font-semibold hover:text-emerald-400 transition-colors"
                    >
                      Sign in instead
                    </button>
                  </>
                ) : (
                  <>
                    New to SmartBudget?{" "}
                    <button
                      type="button"
                      onClick={() => { setIsSignup(true); setError(""); setSuccessMsg(""); setForm({name:"", email:"", password:""}); }}
                      className="text-white font-semibold hover:text-emerald-400 transition-colors"
                    >
                      Create an account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
