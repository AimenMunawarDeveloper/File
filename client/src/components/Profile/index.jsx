import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Image } from 'cloudinary-react';

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // State to store selected file

  const token = localStorage.getItem('token');

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response) {
        throw new Error('Failed to fetch profile data');
      }
      console.log('Profile data:', response.data);
      setProfileData(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    try {
      const formDataWithoutId = { ...formData };
      delete formDataWithoutId._id;
      delete formDataWithoutId.user;
      delete formDataWithoutId.tenant;
      delete formDataWithoutId.__v;
      if (selectedFile) {
        formDataWithoutId.photo = selectedFile;
      }  
      const response = await axios.post('http://localhost:8080/api/profile', formDataWithoutId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Profile updated:', response.data);
      setFormData(response.data);
      setEditMode(false);
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
          // Refetch the profile data after updating
      fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ahblutbj'); // Replace with your upload preset from Cloudinary
      formData.append('crop', 'fill'); // Add crop parameter to fill the circle size
  
      // Adjust the width and height based on your circle size
      formData.append('width', '200');
      formData.append('height', '200');
  
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dxwhmwlqo/image/upload',
        formData
      );
  
      // Extract the public ID from the Cloudinary response and store it in state or send it to the backend
      const publicId = response.data.public_id;
      setSelectedFile(publicId);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <section className="py-10 my-auto dark:bg-gray-900">
      <div className="lg:w-[80%] md:w-[90%] xs:w-[96%] mx-auto flex gap-4">
        <div className="lg:w-[88%] md:w-[80%] sm:w-[88%] xs:w-full mx-auto shadow-2xl p-4 rounded-xl h-fit self-center dark:bg-gray-800/40">
          <div>
          <h1 className="lg:text-3xl md:text-2xl sm:text-xl xs:text-xl font-serif font-extrabold mb-2 dark:text-white">Profile</h1>
            {successMessage && (
              <div className="absolute top-8 right-4 z-50 bg-white p-4 rounded-lg shadow-md">
                <p className="text-purple-600">{successMessage}</p>
              </div>
            )}
              <div className="relative">
              <div className="relative">
  <div className="relative">
    <div className="relative">
      <div className="relative">
        {editMode && (
          <div {...getRootProps()}>
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto relative">
              <div className="w-12 h-12 bg-blue rounded-full flex items-center justify-center absolute bottom-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              {profileData.photo ? (
                <Image cloudName="dxwhmwlqo" publicId={profileData.photo} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            <input {...getInputProps()} />
          </div>
        )}
        {!editMode && (
  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto relative">
    {profileData.photo ? (
       <Image cloudName="dxwhmwlqo" publicId={profileData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )}
  </div>
)}
        {!editMode && <button onClick={handleEdit} className="absolute bottom-4 right-4 px-4 py-2 bg-purple-500 text-white rounded-lg">Edit</button>}
      </div>
    </div>
</div>
</div>
  {!editMode && <button onClick={handleEdit} className="absolute bottom-4 right-4 px-4 py-2 bg-purple-500 text-white rounded-lg">Edit</button>}
</div>
            <div className="mt-4">
              <label className="block dark:text-gray-300">Full Name</label>
              {editMode ? (
                <input 
                  type="text" 
                  name="fullName" 
                  className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                />
              ) : (
                <p className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800">{formData.fullName}</p>
              )}
            </div>
            <div className="mt-4">
              <label className="block dark:text-gray-300">User name</label>
              <input 
                type="text" 
                name="username" 
                className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800" 
                value={formData.username} 
                onChange={handleChange} 
                readOnly={!editMode} // Make this field read-only when edit mode is false
              />
            </div>
            <div className="mt-4">
              <label className="block dark:text-gray-300">Email</label>
              <input type="text" name="email" className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800" value={formData.email} onChange={handleChange} readOnly={!editMode} />
            </div>
            <div className="mt-4">
              <label className="block dark:text-gray-300">Phone Number</label>
              <input type="text" name="phoneNumber" className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800" value={formData.phoneNumber} onChange={handleChange} readOnly={!editMode} />
            </div>
            <div className="mt-4">
              <label className="block dark:text-gray-300">Bio</label>
              <input type="text" name="bio" className="mt-2 p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800" value={formData.bio} onChange={handleChange} readOnly={!editMode} />
            </div>
            {editMode && (
              <div className="mt-4">
                <button onClick={handleSubmit} className="px-4 py-2 bg-purple-500 text-white rounded-lg">Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
