"use client";

import { useState, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/action/axios";
import { getEmailVerification, verifyEmailOTP } from "@/services/api";
import { useToast } from "@/app/components/toast/useToast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface FormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPassword() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isSendLoading, setIsSendLoading] = useState<boolean>(false);
  const [isVerifyOtpLoading, setIsVerifyOtpLoading] = useState<boolean>(false);
  const [isResetLoading, setIsResetLoading] = useState<boolean>(false);
  const [ showPassword, setShowPassword ] = useState<boolean>(false);
  const [ showConfirmPassword, setShowConfirmPassword ] = useState<boolean>(false);
  const router = useRouter();
  const { notify } = useToast();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      // setErrorMessage("Please enter a valid email address.");
      notify("Please enter a valid email address.", "error");
      return;
    }
    setIsSendLoading(true);
    try {
      const response = await getEmailVerification(formData.email.toLowerCase());
      console.log("API Response for getEmailVerification:", response);
      console.log("Message check:", response.message, "Includes OTP sent:", response.message?.toLowerCase().includes("otp sent"));

      if (response.message && typeof response.message === "string" && response.message.toLowerCase().includes("otp sent")) {
        setIsOtpSent(true);
        // setErrorMessage("");
        notify(response.message, "success");
      } else {
        // setErrorMessage(response.message || "Failed to send OTP. Please try again.");
        notify(response.message || "Failed to send OTP. Please try again.", "error");
      }
    } catch (error) {
      // setErrorMessage("An error occurred while sending OTP.");
      notify("An error occurred while sending OTP.", "error");
    } finally {
      setIsSendLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifyOtpLoading(true);
    try {
      const response = await API.post(`/verify_email/${formData.email.toLowerCase()}/${formData.otp}`)
      console.log("API Response for verifyEmailOTP:", response);
      if (response.status === 200) {
        setIsEmailVerified(true);
        setIsOtpSent(false);
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

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      // setErrorMessage("Please enter a new password.");
      notify("Please fill in both password fields.", "error");
      return;
    } 
    
    if (formData.newPassword !== formData.confirmPassword) {
      notify("Passwords do not match.", "error");
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      notify("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.", "error");
      return;
    }
     
    setIsResetLoading(true);
    try {
      const response = await API.put("/forgot_password", { 
        email: formData.email.toLowerCase(),
        password: formData.newPassword,
      });
  
      if (response.status === 200) {
        router.push("/login");
        notify("Password reset successfully! Please login with your new password.", "success");
      } else {
        // setErrorMessage(response.data.message || "Password reset failed. Please try again.");
        notify(response.data.message || "Password reset failed. Please try again.", "error");
      }
    } catch (error) {
      // setErrorMessage("An error occurred while resetting password.");
      notify("An error occurred while resetting password.", "error");
    } finally {
      setIsResetLoading(false);
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
            src="/lawyer.png"
            alt="Logo"
            className="w-12 h-12 mx-2 rounded-full flex justify-center items-center"
          />
          <h2 className="flex justify-center text-[24px] items-center">Forgot Password?</h2>
        </div>
        <div className="p-5">
        <div className="space-y-4">
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
                { isVerifyOtpLoading ? <Spinner borderColor="border-purple-600" /> : 'Verify OTP'}
              </button>
              </div>
            </div>
          )}
          {isEmailVerified && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>
            </>
          )}
          {/* {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>} */}
          <button
            onClick={handleResetPassword}
            type="button"
            className="w-full text-white p-2 mb-2 rounded-xl hover:opacity-90 transition"
            disabled={!isEmailVerified}
            style={{
              background: "linear-gradient(to right, #8383F4, #B054E9)",
            }}            
          >
            { isResetLoading ? <Spinner borderColor="border-white" /> : 'Reset Password'}
          </button>
        </div>       

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