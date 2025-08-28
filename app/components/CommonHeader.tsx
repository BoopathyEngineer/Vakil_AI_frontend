"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "../components/context/AuthContext";

const Header = () => {
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<string>("");
  const { logout } = useAuth();

  useEffect(() => {
    const userEmail = Cookies.get("user");
    if (userEmail) {
      setUser(userEmail);
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-16 flex items-center justify-between px-5">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image src="/lawyer.png" height={40} width={120} alt="logo" />
      </div>

      {/* Avatar & Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <div
          className="cursor-pointer"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <CgProfile className="w-10 h-10 cursor-pointer text-gray-700 bg-gray-200 rounded-full" />
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-0 w-48 bg-white shadow-lg rounded-lg p-2 border">
            <p className="text-sm text-gray-500 p-2 truncate" title={user || "Guest"}>{user || "Guest"}</p>
            <hr className="my-2" />
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-500 hover:bg-gray-100 p-2 rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
