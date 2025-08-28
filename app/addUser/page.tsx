'use client'
import React from 'react'
import Header from '../components/CommonHeader';
import Sidebar from '../components/sideBar';
import AddUserComponent from '../components/addUser';
import API from '../action/axios';
import useAuthStore from '../store/authStore';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToast } from '../components/toast/useToast';

const page = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [showSample, setShowSample] = React.useState<boolean>(false); // State to toggle sample visibility
  const { role } = useAuthStore();
  const { notify } = useToast();

  const handleSubmit = async () => {
    if (!selectedFile) {
      notify("Please select a file.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);

    try {
      const response = await API.post("/bulk_user_create", formData);

      if (response.status === 200) {
        notify("File uploaded successfully!", "success");
        setSelectedFile(null);
      } else {
        notify("File upload failed. Please try again.", "error");
      }
    } catch (error: any) {
      const message = error.response?.data?.detail?.message || "An unexpected error occurred.";
      notify(message || "An error occurred while uploading the file.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="fixed top-16 left-20 md:left-72 right-0 z-40 bg-white px-4 py-4 border-b shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Add User</h1>
      </div>
      <div className={role === "Admin" ? `flex flex-row p-5` : ''}>
        <div className="ml-20 md:ml-72 mt-32 p-4">
          <AddUserComponent />
        </div>
        {role !== "Super Admin" && (
          <div className="ml-10 mt-32 p-4">
            <p className="text-lg font-medium text-gray-700 mb-3">
              Want to add multiple students at once using an Excel file?
            </p>
            <label
              htmlFor="excelUpload"
              className="w-fit text-white p-3 mt-4 ml-10 rounded-xl hover:opacity-90 transition justify-center"
              style={{
                background: "linear-gradient(to right, #8383F4, #B054E9)",
              }}
            >
              Upload Excel File
            </label>
            <input
              id="excelUpload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("Selected file:", file);
                  setSelectedFile(file);
                  notify("File selected: " + file.name, "success");
                } else {
                  notify("Please select a file.", "error");
                  setSelectedFile(null);
                }
              }}
            />
            
            {/* Show Sample Button */}
            <button
              onClick={() => setShowSample(!showSample)}
              className="mx-4 mt-4 p-2 text-gray-700 rounded-lg hover:opacity-90 transition"
              aria-label='Toggle Sample Columns'
              title={showSample ? "Hide Sample Columns" : "Show Sample Columns"}
            >
              {showSample ? <FaEye/> : <FaEyeSlash/>}
            </button>
            <button
              className="w-fit text-white p-2 mt-4 ml-40 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: !selectedFile
                  ? "#5C5C5C" // fallback gray (Tailwind's gray-300)
                  : "linear-gradient(to right, #8383F4, #B054E9)",
              }}
              disabled={!selectedFile || isUploading}
              onClick={handleSubmit}
            >
              {isUploading ? "Uploading..." : "Submit"}
            </button>
            {/* {uploadMessage && (
              <p
                className={`mt-4 ${
                  uploadMessage.includes("successfully") || uploadMessage.includes("selected")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {uploadMessage}
              </p>
            )} */}

            {/* Sample Excel Columns */}
            {showSample && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-md">
                <h3 className="text-xl font-semibold text-gray-700">Sample Excel Columns:</h3>
                <table className="mt-3 w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-left">Column Name</th>
                      <th className="border px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">Username</td>
                      <td className="border px-4 py-2">Name of the student</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Date of Birth</td>
                      <td className="border px-4 py-2">Student's date of birth</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Phone Number</td>
                      <td className="border px-4 py-2">Student's phone number</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Email</td>
                      <td className="border px-4 py-2">Student's email address</td>
                    </tr>
                    {/* Add more columns as needed */}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
