"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/app/components/CommonHeader";
import API from "../action/axios";
import Sidebar from "../components/sideBar";
import useAuthStore from "../store/authStore";
import { useToast } from "../components/toast/useToast";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

type User = {
  id: number;
  username: string;
  dob: string;
  phone_number: string;
  email: string;
  university: string;
};

const Admin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { role } = useAuthStore();
  const { notify } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/list_users_details");
    
      setAllUsers(response.data);
      console.log("Fetched users:", response.data);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching users list:", error);
    } finally {
      setIsLoading(false);
    }    
  }

  useEffect(() => {
    fetchUsers();
  },[])

  const STUDENTS_PER_PAGE = 10;

  useEffect(() => {
    const loadInitialUsers = () => {
      const start = 0;
      const end = STUDENTS_PER_PAGE;
      setDisplayedUsers(allUsers.slice(start, end));
    };
    loadInitialUsers();
  }, [allUsers]);

  const loadMoreUsers = () => {
    setLoading(true);
    setTimeout(() => {
      const start = page * STUDENTS_PER_PAGE;
      const end = start + STUDENTS_PER_PAGE;
      const newUsers = allUsers.slice(start, end);
      setDisplayedUsers((prev) => [...prev, ...newUsers]);
      setPage((prev) => prev + 1);
      if (end >= allUsers.length) {
        setHasMore(false);
      }  
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreUsers();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading]);

  const filteredUsers = displayedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/remove_user?user_id=${id}`); 
  
      setDisplayedUsers((prev) => prev.filter((user) => user.id !== id));
      setAllUsers((prev) => prev.filter((user) => user.id !== id));
      console.log(`User with ID ${id} deleted`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };  

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  }; 

  const handleEditSave = async (updatedUser: User) => {
    try {
      const { id, email, ...rest } = updatedUser;
      const userData = { ...rest, email: email.toLowerCase() };
  
      await API.put(`/update_users?user_id=${id}`, userData);
  
      setDisplayedUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      setAllUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      setIsEditModalOpen(false);
      fetchUsers();
      console.log(`User with ID ${id} updated`);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  function formatDDMMYYYY(dob: string) {
    const [date] = dob.split(" ");         // "YYYY-MM-DD"
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="fixed top-16 left-20 md:left-72 right-0 z-40 bg-white px-4 py-4 border-b shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">{role === "Admin" ? "Students" : "Admins"} Information</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 text-sm"
          />
          <button
            onClick={() => {}}
            className="text-white px-4 py-2 rounded-lg text-sm"
            style={{
              background: "linear-gradient(to right, #8383F4, #B054E9)",
          }}
          >
            Search
          </button>
        </div>
      </div>

      {/* User Cards */}
      <div className="ml-20 md:ml-72 mt-44 md:mt-40 lg:mt-32 p-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-xl p-6 mb-6 flex justify-between items-start shadow-sm"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{user.username}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-800">Date of Birth:</span>  {formatDDMMYYYY(user.dob)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-800">Mobile Number:</span> {user.phone_number}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-800">Email:</span>{" "}
                  <span className="text-gray-800 font-semibold">{user.email}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">University/College:</span>{" "}
                  {user.university}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setUserToDelete(user.id);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center text-red-600 hover:underline font-medium text-sm"
                >
                  <RiDeleteBin6Line className="h-4 w-4 mr-1" />
                  DELETE
                </button>
                <button 
                  onClick={() => openEditModal(user)}
                  className="flex items-center text-gray-700 hover:underline font-medium text-sm"
                >
                  <MdEdit className="h-4 w-4 mr-1"/>
                  EDIT
                </button>
              </div>
            </div>
          ))
        ) : (
          <></>
        )}

        <div ref={observerRef} className="text-center py-6">
          {loading && hasMore && (
            <span className="text-gray-600 text-sm">Loading more users...</span>
          )}
        </div>
      </div>
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;

                const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
                const dob = (form.elements.namedItem("dob") as HTMLInputElement).value.trim();
                const phone_number = (form.elements.namedItem("phone_number") as HTMLInputElement).value.trim();
                const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
                const university = (form.elements.namedItem("university") as HTMLInputElement).value.trim();

                const phoneRegex = /^[0-9]{10}$/;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!username || !dob || !phone_number || !email || !university) {
                  notify("Please fill in all fields before saving.", "error");
                  return;
                }

                if (!phoneRegex.test(phone_number)) {
                  notify("Please enter a valid 10-digit mobile number.", "error");
                  return;
                }
            
                if (!emailRegex.test(email)) {
                  notify("Please enter a valid email address.", "error");
                  return;
                }

                if (dob) {
                  const selectedDate = new Date(dob);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selectedDate > today) {
                    notify("Date of birth cannot be in the future.", "error");
                    return
                  }
                }

                const updatedUser = {
                  ...editingUser,
                  username,
                  dob,
                  phone_number,
                  email,
                  university,
                };

                handleEditSave(updatedUser);
              }}
            >
              <div className="space-y-3">
                <p className="font-bold">Name: </p>
                <input 
                  name="username" 
                  defaultValue={editingUser.username} 
                  className="w-full border p-2 rounded" 
                />
                <p className="pt-3 font-bold">Date of Birth: </p>
                <input 
                  type="date"
                  name="dob" 
                  defaultValue={new Date(editingUser.dob).toISOString().split("T")[0]}
                  className="w-full border p-2 rounded" 
                  max={new Date().toISOString().split("T")[0]}
                />
                <p className="pt-3 font-bold">Phone Number: </p>
                <input 
                  name="phone_number" 
                  defaultValue={editingUser.phone_number} 
                  className="w-full border p-2 rounded" 
                  maxLength={10} 
                  type="tel" 
                  pattern="[0-9]{10}" 
                  inputMode="numeric" 
                  onKeyDown={(e) => {
                    if (
                      !/^[0-9]$/.test(e.key) &&
                      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="pt-3 font-bold">Email: </p>
                <input 
                  name="email" 
                  defaultValue={editingUser.email} 
                  className="w-full border p-2 rounded" 
                />
                <p className="pt-3 font-bold">University: </p>
                <input 
                  name="university" 
                  defaultValue={editingUser.university} 
                  readOnly
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" 
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: "linear-gradient(to right, #8383F4, #B054E9)",}}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (userToDelete !== null) {
                    handleDelete(userToDelete);
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
};

export default Admin;