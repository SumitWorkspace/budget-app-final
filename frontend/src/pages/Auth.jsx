import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  // LOGIN
  const handleLogin = async () => {
    try {
      if (!form.email || !form.password) {
        return alert("Please fill all fields");
      }

      setLoading(true);

      const res = await API.post("/api/users/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        return alert("Please fill all fields");
      }

      setLoading(true);

      await API.post("/api/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert("Signup successful");
      setIsSignup(false);

    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7b0f3a]">
      <div className="w-[900px] h-[500px] bg-white rounded-2xl shadow-2xl flex overflow-hidden relative">

        {/* SLIDER */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full z-10 transition-transform duration-500 ease-in-out ${
            isSignup ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="w-full h-full relative flex items-center justify-center text-white overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-[#7b0f3a] via-[#c2185b] to-[#f06292]" />

            <div className="absolute w-[260px] h-[260px] bg-white/15 rotate-45 rounded-[40px] right-[-70px] top-[60px]" />
            <div className="absolute w-[200px] h-[200px] bg-[#ad1457] rotate-45 rounded-[40px] right-[-50px] bottom-[30px]" />
            <div className="absolute w-[160px] h-[160px] bg-[#880e4f] rotate-45 rounded-[40px] right-[-30px] top-[200px]" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="bg-white text-black px-6 py-2 rounded-full font-semibold shadow">
                {isSignup ? "SIGN UP" : "LOGIN"}
              </div>

              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-white opacity-80 hover:opacity-100"
              >
                {isSignup ? "LOGIN" : "SIGN UP"}
              </button>
            </div>

          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="w-1/2 flex flex-col justify-center px-10 bg-white">
          <h2 className="text-center text-2xl font-semibold text-pink-700 mb-6">
            LOGIN
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="border-b mb-4 py-2"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="border-b mb-2 py-2"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <p
            onClick={() => setShowForgot(true)}
            className="text-xs text-pink-500 mb-4 cursor-pointer hover:underline"
          >
            Forgot Password?
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-pink-500 text-white px-6 py-2 rounded-full self-end disabled:opacity-60"
          >
            {loading ? "Please wait..." : "LOGIN"}
          </button>
        </div>

        {/* SIGNUP FORM */}
        <div className="w-1/2 flex flex-col justify-center px-10 bg-white">
          <h2 className="text-center text-2xl font-semibold text-pink-700 mb-6">
            SIGN UP
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            className="border-b mb-4 py-2"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="border-b mb-4 py-2"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="border-b mb-6 py-2"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="bg-pink-500 text-white px-6 py-2 rounded-full self-end disabled:opacity-60"
          >
            {loading ? "Please wait..." : "SIGN UP"}
          </button>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgot && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[300px] shadow-xl">

              <h3 className="text-lg font-semibold mb-4 text-center">
                Reset Password
              </h3>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border-b mb-4 py-2 outline-none"
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowForgot(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    alert("Reset link sent");
                    setShowForgot(false);
                  }}
                  className="bg-pink-500 text-white px-4 py-1 rounded"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}