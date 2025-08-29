import { addUser, AddUserData } from "@/services/api";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import { useToast } from "./toast/useToast";

const AddUserComponent = () => {
    const { role, university } = useAuthStore(); // Now properly typed
    const { notify } = useToast();
    const [formData, setFormData] = useState({
        role: "",
        username: "",
        dob: "",
        phone_number: "",
        email: "",
        // password: "",
        university: role === "Super Admin" ? "" : university,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "dob") {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                notify("Date of birth cannot be in the future.", "error");
                return
            } 
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                notify("Please enter a valid email address.", "error");
                return;
            }
            const userData: AddUserData = {
                ...formData,
                email: formData.email.toLowerCase(),
                university: formData.role === "Super Admin" ? "" : formData.university || "",
            };
            const response = await addUser(userData);
            if (response.success) {
                notify("User added successfully!", "success");
          
                setFormData({
                  role: "",
                  username: "",
                  dob: "",
                  phone_number: "",
                  email: "",
                  university: "",
                });
              }
        } catch (error: any) {
            const status = error.response?.status;
            const message = error.response?.data?.detail || "An unexpected error occurred.";
        
            if (status === 500) {
              notify(message, "error");
            } else if (status === 400 || status === 409) {
              notify(message, "error"); // handle other known failures
            } else {
              notify("An unexpected error occurred while adding the user.", "error");
            }
        }
    };

    return (
        <div className=" max-w-md mx-auto bg-white rounded-2xl shadow-lg">
            {/* Header with gradient and logo */}
            {/* <div className="flex items-center justify-start bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-t-2xl">
                <img src="/loyola-logo.svg" alt="Logo" className="w-12 h-12 mr-2" />
                <h2 className="text-2xl font-bold text-white">Add User</h2>
            </div> */}
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <select
                    name="role"
                    value={formData.role}
                    // defaultValue={'student'}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                {role === "Admin" && (
                    <>
                        <option value="" disabled={!!formData.role}>Select</option>
                        <option value="Student">Student</option>
                    </>
                )}
                {role === "Super Admin" && (
                    <>
                        <option value="" disabled={!!formData.role}>Select</option>
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                    </>
                  )}
                </select>
                <input
                    name="username"
                    value={formData.username}
                    placeholder="Username"
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="relative">
                    <input
                        name="dob"
                        type="date"
                        value={formData.dob}
                        placeholder="DD-MM-YYYY"
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <input
                    name="phone_number"
                    value={formData.phone_number}
                    placeholder="Mobile Number"
                    onChange={handleChange}
                    required
                    type="tel"
                    maxLength={10} 
                    pattern="[0-9]{10}" 
                    inputMode="numeric"
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onKeyDown={(e) => {
                        if (
                          !/^[0-9]$/.test(e.key) &&
                          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                    }}
                />
                <input
                    name="email"
                    value={formData.email}
                    type="email"
                    placeholder="Email ID"
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {role === "Super Admin" && formData.role === "Admin" && <input
                    name="university"
                    value={formData.university || ""}
                    placeholder="University/College Name"
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    disabled={!formData.role}
                />}
                {/* <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                /> */}
                <button 
                    type="submit" 
                    className="w-full text-white p-2 mb-2 rounded-xl hover:opacity-90 transition"
                    style={{
                        background: "linear-gradient(to right, #8383F4, #B054E9)",
                    }}
                >Submit</button>
            </form>
        </div>
    );
};

export default AddUserComponent;