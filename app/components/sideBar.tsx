"use client";

import { MdDashboard, MdList } from "react-icons/md";
import { IoMdPersonAdd } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { useState, ReactNode, useEffect } from "react";
import useAuthStore from "../store/authStore";

type SidebarItem = {
  name: string;
  route: string;
  icon: ReactNode;
};

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {role} = useAuthStore();
  const [activePath, setActivePath] = useState<string>("");

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const sidebarItems: SidebarItem[] = [
    ...(role === "Super Admin"
      ? [{ name: "Admins List", route: "/admin", icon: <MdList /> }] 
      : [{ name: "Students List", route: "/admin", icon: <MdList /> }]),
    ...(role === "Super Admin"
      ? [{ name: "Add Admin", route: "/addUser", icon: <IoMdPersonAdd /> }]
      :[{ name: "Add Students", route: "/addUser", icon: <IoMdPersonAdd /> }]),
    { name: "Chat DashBoard", route: "/dashboard", icon: <MdDashboard /> },
  ];

  const handleSidebarClick = (route: string) => {
    if (route !== activePath) {
      setActivePath(route);
      router.push(route);
    }
  };

  return (
    <div className="fixed top-16 inset-y-0 left-0 z-40 w-20 md:w-72 bg-white text-white shadow-lg transition-all duration-300 ease-in-out flex flex-col">
      <nav className="flex-1 px-4 mt-4 space-y-3">
        {sidebarItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 text-lg font-medium 
              ${activePath === item.route 
                ? "shadow-md text-white bg-gradient-to-r from-[#8383F4] to-[#B054E9]" 
                : "text-black hover:bg-gray-200"} group`}
            onClick={() => handleSidebarClick(item.route)}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="ml-3 hidden md:block">{item.name}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
