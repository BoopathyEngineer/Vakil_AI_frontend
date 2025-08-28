"use client";

import { useState, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { getEmailOTP, signup, verifyEmailOTP } from "@/services/api";
import { useToast } from "@/app/components/toast/useToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "@/app/action/axios";

interface FormData {
  username: string;
  dob: string;
  phone: string; 
  email: string;
  otp: string;
  password: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    dob: "",
    phone: "",
    email: "",
    otp: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendLoading, setIsSendLoading] = useState<boolean>(false);
  const [isVerifyOtpLoading, setIsVerifyOtpLoading] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const router = useRouter();
  const { notify } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        // setErrorMessage("Date of birth cannot be in the future.");
        notify("Date of birth cannot be in the future.", "error");
        return
      } 
      // else {
      //   setErrorMessage("");
      // }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    const requiredFields = ["email"] as const;
    const emptyFields = requiredFields.filter((field: keyof FormData) => !formData[field].trim());
    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in all fields. Missing: ${emptyFields.join(", ")}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notify("Please enter a valid email address.", "error");
      return;
    }

    setIsSendLoading(true);
    if (!formData.email) {
      // setErrorMessage("Please enter a valid email address.");
      notify("Please enter a valid email address.", "error");
      return;
    }
    try {
      const response = await API.post(`/auth/get_email/${formData.email.toLowerCase()}?new_user=true`)
      console.log("API Response for getEmailOTP:", response);

      if (response.status === 200) {
        setIsOtpSent(true);
        notify(response.data.message, "success");
        setErrorMessage("");
      } 
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "An error occurred while sending OTP.";
      notify(errorMsg, "error");  
    } finally {
      setIsSendLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const requiredFields = ["otp"] as const;
    const emptyFields = requiredFields.filter((field: keyof FormData) => !formData[field].trim());
    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in all fields. Missing: ${emptyFields.join(", ")}`);
      return;
    }
    setIsVerifyOtpLoading(true);
    try {
      const response = await API.post(`/auth/verify_email/${formData.email.toLowerCase()}/${formData.otp}`)
      console.log("API Response for verifyEmailOTP:", response);
      // (response.status && typeof response.status === "string" && response.status === "success") ||
      if (response.status === 200) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
        setErrorMessage("");
        // setErrorMessage("Email verified successfully!");
        notify("Email verified successfully!", "success");
        console.log("After verification - isEmailVerified:", true, "isOtpSent:", false);
      } else {
        // setErrorMessage(response.message || "Invalid OTP. Please try again.");
        notify(response.data.detail || "Invalid OTP. Please try again.", "error");
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Invalid OTP. Please try again.";
      notify(errorMsg, "error");  
    } finally {
      setIsVerifyOtpLoading(false);
    }
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEmailVerified) {
      // setErrorMessage("Please verify your email before signing up.");
      notify("Please verify your email before signing up.", "error");
      return;
    }

    const requiredFields = ["username", "dob", "phone", "email", "password"] as const;
    const emptyFields = requiredFields.filter((field: keyof FormData) => !formData[field].trim());
    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in all fields. Missing: ${emptyFields.join(", ")}`);
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      notify("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const signupData = {
        role: "General",
        username: formData.username,
        dob: formData.dob,
        phone_number: formData.phone,
        email: formData.email.toLowerCase(),
        password: formData.password,
        university: "",
      };
      const response = await signup(signupData);
      console.log("API Response for signup:", response);

      if (response.message && typeof response.message === "string" && response.message.toLowerCase().includes("successfully")) {
        router.push("/login");
      } else {
        // setErrorMessage(response.message || "Signup failed. Please try again.");
        notify(response.message || "Signup failed. Please try again.", "error");
      }
    } catch (error) {
      // setErrorMessage("An error occurred during signup.");
      notify("An error occurred during signup.", "error");
    } finally { 
      setIsLoading(false);
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
  };

  const Spinner = ({ borderColor }: { borderColor: string }) => (
    <div className="flex items-center justify-center">
      <div className={`w-6 h-6 border-4 ${borderColor} border-solid rounded-full border-t-transparent animate-spin`}></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
        <div 
          className="px-6 py-3 text-white text-center flex items-center justify-center"
          style={{
            background: "linear-gradient(to right, #8383F4, #B054E9)",
          }}
        >
          <img
            src="/lawyer.pngg"
            alt="Logo"
            className="w-12 h-12 mx-2 rounded-full flex justify-center items-center"
          />
          <h2 className="flex justify-center text-[24px] items-center">Sign Up to Get Started</h2>
        </div>
        <div className="p-5">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* <div> */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          {/* </div>
          <div> */}
            <input
              type="date"
              name="dob"
              placeholder="DD-MM-YYYY"
              value={formData.dob}
              // onFocus={(e) => (e.target.type = 'date')}
              // onBlur={(e) => formData.dob || (e.target.type = 'text')}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
              max={new Date().toISOString().split("T")[0]}
            />
          {/* </div> */}
          {/* <div> */}
            <input
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              maxLength={10} 
              pattern="[0-9]{10}" 
              inputMode="numeric"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (
                  !/^[0-9]$/.test(e.key) &&
                  !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full p-3 bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          {/* </div> */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="email"
                name="email"
                placeholder="Email ID"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                disabled={isEmailVerified}
              />
            </div>
            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-purple-600 hover:underline"
              >
                { isSendLoading ? <Spinner borderColor="border-purple-600" /> : isOtpSent ? 'Resend OTP':'Verify'}
              </button>
            )}
          </div>
          {isOtpSent && !isEmailVerified && (
            <div className="space-y-2">
              {/* <div> */}
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  onKeyDown={handleOtpKeyDown}
                  className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              {/* </div> */}
              <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="text-purple-600 hover:underline"
              >
                { isVerifyOtpLoading ? <Spinner borderColor="border-purple-600" /> :'Verify'}
              </button>
              </div>
            </div>
          )}
          {/* <div> */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
              disabled={!isEmailVerified}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>
          {/* </div>
          <div> */}
            
          {/* </div> */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          <button
            // onSubmit={handleSignup}
            // type="submit"
            className="w-full text-white p-2 mb-2 rounded-xl hover:opacity-90 transition"
            disabled={!isEmailVerified}
            style={{
              background: "linear-gradient(to right, #8383F4, #B054E9)",
            }}            
          >
            { isLoading ? <Spinner borderColor="border-white" /> : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Sign In
          </a>
        </p>
        </div>
      </div>
    </div>
  );
}