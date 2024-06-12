import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { Link ,useNavigate} from "react-router-dom";

const PersonalStorage = () => {
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingFile, setEditingFile] = useState(null);
  const [editingFileName, setEditingFileName] = useState("");
  const [editingFileObj, setEditingFileObj] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false); // Add state for edit popup
  const [isDragActive, setIsDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query
  const [dateUploaded, setDateUploaded] = useState(""); // Add state for date uploaded filter
  const [searchResults, setSearchResults] = useState([]); // Add state for search results
  const [sidepanelOpen, setSidepanelOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const { data } = await axios.get("https://localhost:8080/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(data);
      setSearchResults(data); // Initialize search results with all files
    } catch (error) {
      setError("Error fetching files");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEditFileChange = (e) => {
    setEditingFileObj(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", fileName);

    try {
      await axios.post("https://localhost:8080/api/files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchFiles();
      setFileName("");
      setFile(null);
      setSuccess("File uploaded successfully");
      setError("");
      setShowUploadPopup(false); // Close the upload popup after successful upload
    } catch (error) {
      setError("Error uploading file");
      setSuccess("");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:8080/api/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchFiles();
    } catch (error) {
      setError("Error deleting file");
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setEditingFileName(file.name);
    setShowEditPopup(true); // Show edit popup when edit button is clicked
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editingFileName);

    if (editingFileObj) {
      formData.append("file", editingFileObj);
    }

    try {
      await axios.put(
        `https://localhost:8080/api/files/${editingFile._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingFile(null);
      setEditingFileName("");
      setEditingFileObj(null);
      fetchFiles();
      setSuccess("File updated successfully");
      setError("");
      setShowEditPopup(false); // Close edit popup after successful update
    } catch (error) {
      setError("Error updating file");
      setSuccess("");
    }
  };

  const handleSearch = () => {
    const filteredFiles = files.filter(file => {
      const matchesName = searchQuery ? file.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchesDate = dateUploaded ? new Date(file.createdAt).toLocaleDateString() === new Date(dateUploaded).toLocaleDateString() : true;

      return matchesName && matchesDate;
    });

    setSearchResults(filteredFiles);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const openNav = () => {
    setSidepanelOpen(!sidepanelOpen);
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logging out...');
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login page
    window.location.reload();
  };
  const closeNav = () => {
    setSidepanelOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white transition-width duration-300 ease-in-out ${sidepanelOpen ? 'w-56' : 'w-0'} overflow-hidden`}>
        <div className="p-4">
          <h1 className="text-2xl font-semibold">Sidebar</h1>
          <ul className="mt-4 space-y-5">
          <li className="mb-2">
              <Link to="/" className="block hover:text-indigo-400" onClick={closeNav}>Dashboard</Link>
            </li>
            <li className="mb-2">
              <Link to="/personal-storage" className="block hover:text-indigo-400" onClick={closeNav}>Add File</Link>
            </li>
            <li className="mb-2">
              <Link to="/profile" className="block hover:text-indigo-400" onClick={closeNav}>Edit Profile</Link>
            </li>
            <li className="mb-2">
              <button onClick={handleLogout} className="block hover:text-indigo-400">Logout</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="bg-purple-400 p-3">
          <div className="container mx-auto">
            <div className="flex justify-between items-center ">
              <h1 className="text-white font-bold text-3xl mb-4 lg:mb-0">Personal Storage</h1>
              <button className="text-gray-500 hover:text-gray-600" onClick={openNav}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              type="text"
              placeholder="Search by file name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              type="date"
              placeholder="Search by date uploaded"
              value={dateUploaded}
              onChange={(e) => setDateUploaded(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
          <button
            className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => setShowUploadPopup(true)}
          >
            Upload File
          </button>
          </div>
          {/* File list */}
          <div className="mt-4">
            {searchResults.map((file) => (
              <div key={file._id} className="border p-4 rounded mb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold">{file.name}</h2>
                  <p className="text-gray-600">Uploaded on: {new Date(file.createdAt).toLocaleDateString()}</p>
                </div>
                <div>

                  <button
                    onClick={() => handleEdit(file)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Popup */}
          {showUploadPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Upload File</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                    type="text"
                    placeholder="File name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded p-4 text-center ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                  >
                    <input {...getInputProps()} onChange={handleFileChange} />
                    {file ? (
                      <p>{file.name}</p>
                    ) : (
                      <p>Drag 'n' drop a file here, or click to select a file</p>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                      onClick={() => setShowUploadPopup(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Popup */}
          {showEditPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Edit File</h2>
                <form onSubmit={handleEditSubmit}>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                    type="text"
                    placeholder="File name"
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                  />
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                    type="file"
                    onChange={handleEditFileChange}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                      onClick={() => setShowEditPopup(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalStorage;
