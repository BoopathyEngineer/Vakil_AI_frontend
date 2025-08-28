"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Cookies from "js-cookie";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { ChatResponse, createChat } from "../../services/api";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import useAuthStore from "../store/authStore";
import API from "../action/axios";
import { useToast } from "../components/toast/useToast";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useAuth } from "../components/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [userId, setUserId] = useState<number>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstQueries,setFirstQieries] = useState<{ chat_id: string; message: any }[]>([])
  const currentUserId: string | undefined = Cookies.get("userId");
  const id: number | undefined = currentUserId ? parseInt(currentUserId) : undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  const { notify } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<String | null>(null);
  const [activePath, setActivePath] = useState(pathname);
  const { logout } = useAuth();

  useLayoutEffect(() => {
    setActivePath(pathname);
  }, [pathname]);
  
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    if (input.length > 0) {
      ta.style.height = `${ta.scrollHeight}px`;
    } else {
      ta.style.height = '45px';
    }
  }, [input]);

  useEffect(() => {
    const userEmail = Cookies.get("user");
    
    if (userEmail) {
      setUser(userEmail);
    }
  }, []);
  
  useEffect(() => {
    setUserId(id);
  }, [id]);

  useEffect(()=>{
    getFirstQueriesByChat(chats)
  },[chats])
  
  const fetchChatHistory = async () => {
    console.log(">>>>",typeof(userId))
    try {
      const response = await API.get(`chat/chat/history?user_id=${userId}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch chat history");
      }
      const data = response.data;
      console.log("Chat history:", data);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    console.log("userId>>>>>>>>>>>>",userId)
    if(userId){
      fetchChatHistory();
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await API.delete(`chat/delete_chat_history/${chatId}`);
      if (response.status === 200) {
        setChats((prevChats) => prevChats.filter((chat) => chat.chat_id !== chatId));
        Cookies.remove(`chat_${chatId}_initialQuery`);
        notify("Chat deleted successfully", "success");
      } else {
        notify("Failed to delete chat", "error");
      }
      if(activePath === `/chat/${chatId}`){
        router.push("/dashboard"); 
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      notify("Failed to delete chat", "error");
    }
  }

  const getFirstQueriesByChat = (chats: ChatResponse[]): { chat_id: string; message: any }[] => {
    const firstMessages: { chat_id: string; message: any }[] = [];
    if(chats){
    chats.forEach((chat) => {
      if (chat.messages && chat.messages.length > 0) {
        const firstMessage = chat.messages.reduce((minMessage, currentMessage) =>
          new Date(currentMessage.created_at) < new Date(minMessage.created_at)
            ? currentMessage
            : minMessage
        );
        firstMessages.push({ chat_id: chat.chat_id, message: firstMessage });
      }
    });
  }
    setFirstQieries(firstMessages)
    return firstMessages;
  };

  // const firstQueries = getFirstQueriesByChat(chats);
  console.log("First Queries:", firstQueries);

  const sendInitialQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      let requestBody ={}
      if(Cookies.get("chatId")){
        requestBody = {
          prompt: input.trim(),
          user_id : userId, 
          chat_id: Cookies.get("chatId"),
        };
      } else{
        requestBody = {
          prompt: input.trim(),
          user_id : userId, 
          chat_id: null,
        };
      }

      const createChatResponse: any = await createChat(userId as number);

      console.log(createChatResponse, "---------------------------");

      getFirstQueriesByChat(chats);

      const newChatId = createChatResponse?.chat_id;

      if (newChatId) {
        const newChat: ChatResponse = {
          chat_id: newChatId,
          user_id: userId as number,
          messages: [
            {
              message_id: "new-message-id",
              query: input.trim(),
              answer: { text_response: "", image_urls: [], video_urls: [], suggestion_questions: [], sources: [] },
              created_at: new Date().toISOString(),
            },
          ],
        };
        setChats((prevChats) => [...prevChats, newChat]);
        getFirstQueriesByChat([...chats, newChat]);
        Cookies.set("chatId", newChatId, { expires: 7, secure: true, sameSite: "Strict",  });
        Cookies.set(`chat_${newChatId}_initialQuery`, input.trim(), { expires: 1 });
        router.push(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error("Error sending initial query:", error);
      notify("Failed to start chat. Please try again.", "error");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleChatSelection = (chatId: string) => {
    Cookies.set("chatId", chatId, { expires: 7, secure: true, sameSite: "Strict" }); // Store selected chatId in cookie
    router.push(`/chat/${chatId}`);
  };

  const newChat = () => {
    setInput("");
    Cookies.remove("chatId");
    router.push(`/dashboard`);
  };

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      {/* moved sidebar to left */}
      <aside
        className={`bg-white text-black border-r flex flex-col fixed inset-y-0 left-0 z-40 w-64 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-all duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:transform-none ${isSidebarOpen ? "md:w-72" : "md:w-0 md:overflow-hidden md:border-none"}`}
      >
        <div className="flex-1 space-y-2 mt-10 overflow-y-auto">
          <div className="w-full flex justify-center items-center">
            <div
              className="flex justify-center py-3 gap-4 rounded-full px-5 items-center bg-[#ECF1FF] cursor-pointer text-md"
              onClick={() => {
                setInput("");
                newChat();
              }}
            >
              <FaPlus /> <span className="truncate">New Chat</span>
            </div>
          </div>
          <div className="w-full h-fit p-2 pt-10">
            <p className="px-2 font-semibold">Recent</p>
            <div className="pt-5 text-sm flex flex-col gap-2">
              {firstQueries?.length > 0 ? (
                [...firstQueries].reverse().map((entry) => {
                  const isSelected = Cookies.get("chatId") === entry.chat_id;
                  return (
                    <div
                      key={entry.chat_id}
                      className={`relative group p-2 rounded-lg hover:bg-[#ECF1FF] ${isSelected ? "bg-[#D1DAFF] font-bold" : "bg-white"} truncate flex justify-between items-center`}
                      onClick={() => handleChatSelection(entry.chat_id)}
                    >
                      <div
                        className="w-full truncate cursor-pointer"
                        onClick={() => handleChatSelection(entry.chat_id)}
                      >
                        <p className="text-[13px] truncate">
                          {entry.message.query.length > 35
                            ? entry.message.query.slice(0, 35) + "..."
                            : entry.message.query}
                        </p>
                      </div>
                      <div
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <button
                          className="hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleDeleteChat(entry.chat_id);
                            setShowDeleteModal(true);
                            setChatToDelete(entry.chat_id);
                          }}
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">
                  No recent chats found.
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white text-black flex justify-end items-center relative">
          <button
            className={`${isSidebarOpen ? "fixed z-50" : "ml-3" } top-4 left-4 p-2 rounded-md`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <GiHamburgerMenu className="text-black" />
          </button>
          <div className="relative group flex justify-between w-full h-full px-5 items-center">
            <div>
              <Image 
                src="/lawyer.png" 
                height={20} 
                width={80} 
                alt="logo" 
                style={{ 
                  objectFit: 'contain',
                  height: 'auto'
                }}
                priority
              />
            </div>
            <div className="flex items-center gap-4">
              { (role === "Admin" || role === "Super Admin") && 
                <button
                  className="w-fit text-white p-2 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                  style={{
                    background: "linear-gradient(to right, #8383F4, #B054E9)",
                  }}
                  onClick={() => {router.push(`/admin`);}}
                >
                  Dashboard
                </button>
              }
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
                  <div className="absolute right-0 top-10 w-48 bg-white shadow-lg rounded-lg p-2 border z-50">
                    <p className="text-sm text-gray-500 p-2 truncate" title={user ? user : "Guest"}>{user ? user : "Guest"}</p>
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
            </div>
          </div>
          {/* <button
            className="text-black rounded p-2 bg-[#ECF1FF] absolute right-[-2px]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? ">" : "<"}
          </button> */}
        </header>

        {/* Chat Container */}
        <div className="grow overflow-auto bg-gray-50">{children}</div>

        {/* Input Form (Always Visible) */}
        {pathname === "/dashboard" && (
          <div className="flex justify-center pb-5 bg-gray-50">
            <form
              ref={formRef}
              onSubmit={sendInitialQuery}
              className="flex items-center p-2 border bg-white w-[75%] rounded-2xl"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 rounded-lg focus:outline-none text-black resize-none overflow-auto min-h-[45px] max-h-[200px]"
                placeholder="Enter your question..."
                disabled={loading}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
             <button
              type="submit"
              disabled={loading}
              className="ml-2 p-2 rounded-full disabled:opacity-50"
              style={{
                background: "linear-gradient(to right, #8383F4, #B054E9)",
              }}
            >
              {loading ? "..." : <IoSend className="text-white text-lg" />}
            </button>
            </form>
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this chat?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (chatToDelete !== null) {
                    handleDeleteChat(String(chatToDelete));
                  }
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
