"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie
import Link from "next/link"; // Import Link for navigation
import { checkLogin } from "@/services/api";
import useAuthStore from "@/app/store/authStore";
import { useToast } from "@/app/components/toast/useToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { role, setRole, setUniversity } = useAuthStore();
  const { notify } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      router.replace("/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  if (isCheckingAuth) return null;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await checkLogin(email.toLowerCase(), password);
      if (response.is_verified) {
        setRole(response?.role);
        setUniversity(response?.university);
        // Save token in cookies
        Cookies.set("authToken", response?.jwt_token, {
          expires: 7, // Expires in 7 days
          secure: true, // Ensures it's only sent over HTTPS
          sameSite: "Strict", // Protects from CSRF attacks
        });
        Cookies.set("user", response?.email, {
          expires: 7, // Expires in 7 days
          secure: true, // Ensures it's only sent over HTTPS
          sameSite: "Strict", // Protects from CSRF attacks
        });
        Cookies.set("role", response?.role, {
          expires: 7, // Expires in 7 days
          secure: true, // Ensures it's only sent over HTTPS
          sameSite: "Strict", // Protects from CSRF attacks
        });
        Cookies.set("userId", response?.user_id, {
          expires: 7, // Expires in 7 days
          secure: true, // Ensures it's only sent over HTTPS
          sameSite: "Strict", // Protects from CSRF attacks
        });
        Cookies.set("university", response?.university, {
          expires: 7, // Expires in 7 days
          secure: true, // Ensures it's only sent over HTTPS
          sameSite: "Strict", // Protects from CSRF attacks
        });
        Cookies.remove("chatId");
        let role = Cookies.get('role')
        if(role === 'Student' || role === 'General'){
          router.push("/dashboard");
        }
        else if (role === 'Admin' || role === 'Super Admin'){
          router.push("/admin");
        } // Redirect to dashboard
        notify('Login Successful', 'success');
      } else {
        // setErrorMessage("Invalid credentials.");
        notify('Invalid credentials.', 'error');
      }
    } catch (error) {
      // setErrorMessage("Login failed. Please check your credentials.");
      notify('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className={`w-6 h-6 border-4 border-white border-solid rounded-full border-t-transparent animate-spin`}></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
       {/* Logo at the top center */}
       <div className="flex justify-center">
          <img
            src="/lawyer.png"
            alt="Logo"
            className="w-36 h-28"
          />
        </div>
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
       
        
        {/* Header with gradient background */}
        <div 
          className="px-6 py-4 text-white text-center"
          style={{
            background: "linear-gradient(to right, #8383F4, #B054E9)",
          }}
        >
          <h2 className="text-[24px]">Sign In to Get Started</h2>
        </div>
        
        <div className="p-5">
          <h2 className="text-sm text-gray-600 mb-1">Email Address</h2>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <h2 className="text-sm text-gray-600 mb-1">Password</h2>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mt-1 block w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full text-white p-2 mb-2 rounded-xl hover:opacity-90 transition"
            style={{
              background: "linear-gradient(to right, #8383F4, #B054E9)",
            }}
          >
            {loading ? <Spinner/> : 'Sign In'}
          </button>

          {/* Add Sign up link */}
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-500 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-center mt-4 text-sm text-gray-600">
            Forgot Password?{" "}
            <Link href="/forgotPassword" className="text-purple-500 hover:underline">
              Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
