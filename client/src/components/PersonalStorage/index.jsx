import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from 'react-dropzone';

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
  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(data);
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
      await axios.post("http://localhost:8080/api/files", formData, {
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
      await axios.delete(`http://localhost:8080/api/files/${id}`, {
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
        `http://localhost:8080/api/files/${editingFile._id}`,
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

  return (
    <div className="flex flex-col h-full">
       <nav className="bg-purple-400 p-3">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="text-white font-bold text-3xl mb-4 lg:mb-0">User Storage</div>
          <div className="lg:flex flex-col lg:flex-row lg:space-x-4 lg:mt-0 mt-4 flex flex-col items-center text-xl">
            <a href="/" className="text-white  px-4 py-2 hover:text-purple-600 ">Dashboard</a>
            <a href="/" className="text-white  px-4 py-2 hover:text-purple-600 ">Edit Account</a>
            <button
            className="bg-purple-600 text-white font-bold py-2 px-4 rounded border border-purple-600 hover:bg-purple-800 focus:outline-none focus:shadow-outline"
            onClick={() => setShowUploadPopup(true)}
            >
            Upload File
            </button>
          </div>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto p-4">
        {showUploadPopup && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3
                    className="block text-gray-700 text-lg font-bold mb-3"
                    id="modal-title"
                  >
                    Upload File
                  </h3>
                  <div className="sm:flex sm:items-start">
                    <form className="w-full" onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="fileName"
                        >
                          File Name
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="fileName"
                          type="text"
                          placeholder="Enter file name"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="file"
                        >
                          Choose File
                        </label>
                        <div className="flex items-center justify-center">
                        <div className={`w-[400px] relative border-2 border-dashed rounded-lg p-6 ${isDragActive ? 'border-indigo-600' : 'border-gray-300'}`} {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="text-center">
          <img className="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            <label htmlFor="file-upload" className="relative cursor-pointer">
              <span>Drag and drop</span>
              <span className="text-purple-600"> or browse</span>
              <span> to upload</span>
            </label>
          </h3>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      </div>
                      </div>
                      <div className="flex items-center justify-center">
  <button
    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto"
    type="submit"
  >
    Upload File
  </button>
</div>
                    </form>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => setShowUploadPopup(false)}
                    >
                      Close
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditPopup && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3
                    className="block text-gray-700 text-lg font-bold mb-3"
                    id="modal-title"
                  >
                    Edit File
                  </h3>
                  <div className="sm:flex sm:items-start">
                    <form className="w-full" onSubmit={handleEditSubmit}>
                      <div className="mb-4">
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="editFileName"
                        >
                          File Name
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="editFileName"
                          type="text"
                          placeholder="Enter file name"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="editFile"
                        >
                          Choose File
                        </label>
                        <div className="flex items-center justify-center">
  <div className={`w-[400px] relative border-2 border-dashed rounded-lg p-6 ${isDragActive ? 'border-purple-600' : 'border-gray-300'}`} {...getRootProps()}>
    <input {...getInputProps()} />
    <div className="text-center">
      <img className="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        <label htmlFor="file-upload" className="relative cursor-pointer">
          <span>Drag and drop</span>
          <span className="text-purple-600"> or browse</span>
          <span> to upload</span>
        </label>
      </h3>
      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
    </div>
  </div>
</div>
                      </div>
                      <div className="flex justify-center">
  <button
    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    type="submit"
  >
    Update File
  </button>
</div>
                    </form>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                    <button
                      className="bg-red-500 hover:bg-p-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => setShowEditPopup(false)}
                    >
                      Close
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {error && (
            <div className="bg-red-100 text-red-700 py-2 px-4 mb-4 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 py-2 px-4 mb-4 rounded">
              {success}
            </div>
          )}
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li
                key={file._id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                <button
  onClick={() => handleDelete(file._id)}
  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
</button>
<button
  onClick={() => handleEdit(file)}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M15.95 3.95a3 3 0 00-4.24 0L3 11.75v3.54h3.54L15.95 7.19a3 3 0 000-4.24zM5 15.29V13.5h1.79l7.79-7.79 1.79 1.79-7.79 7.79H5z"
      clipRule="evenodd"
    />
  </svg>
</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonalStorage;
