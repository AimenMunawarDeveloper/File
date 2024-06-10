import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement} from 'chart.js';

const Main = () => {
  const [sidepanelOpen, setSidepanelOpen] = useState(false);
  const [fileStats, setFileStats] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [usedStorage, setUsedStorage] = useState(0);
  const totalStorage = 1000000000; // Assume 1GB total storage

  

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("token");
    window.location.reload();
  };

  const openNav = () => {
    setSidepanelOpen(!sidepanelOpen);
  };

  const closeNav = () => {
    setSidepanelOpen(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/files/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFileStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchRecentFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching recent files with token:", token);

        const response = await axios.get("http://localhost:8080/api/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Recent files response:", response.data);
        setRecentFiles(response.data);
      } catch (error) {
        console.error("Error fetching recent files:", error);
      }
  }});


  // Function to get month name from month number
  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidepanelOpen ? 'w-56' : 'w-0'} overflow-hidden bg-gray-800 text-white transition-width duration-300 ease-in-out`}>
  <div className="p-4">
    <h1 className="text-2xl font-semibold">Sidebar</h1>
    <ul className="mt-4 space-y-5">
      <li className="mb-2">
        <Link to="/personal-storage" className="block hover:text-indigo-400" onClick={closeNav}>Add File</Link>
      </li>
      <li className="mb-2">
        <Link to="/add-account" className="block hover:text-indigo-400" onClick={closeNav}>Add Account</Link>
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
            <div className="flex justify-between items-center py-4 px-2">
              <h1 className="text-white font-bold text-3xl mb-4 lg:mb-0">File Stash</h1>
              <button className="text-gray-500 hover:text-gray-600" onClick={openNav}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4">
          <h2 className="text-xl font-bold mb-2 mt-2">Number of files uploaded each month</h2>
          <div className="container mx-auto px-4 py-8 mt-8">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={fileStats.map((stat) => ({
                month: `${getMonthName(stat._id.month)} ${stat._id.year}`,
                fileCount: stat.count, 
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fileCount" stroke="rgba(103, 58, 183, 1)" fill="rgba(103, 58, 183, 0.2)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 mt-8">Recent Files</h2>
            <div className="flex flex-wrap">
  {recentFiles.map((file, index) => (
    <div
      key={file._id}
      className="m-2 p-4 lg:px-10 hover:shadow-indigo-300 hover:shadow-lg rounded-lg border"
    >
      <div className="flex justify-center items-start flex-col p-5 ">
        <div className="flex justify-center items-start flex-col text-left gap-5">
          <div>
            <h3 className="text-xl md:text-xl font-semibold">{file.name}</h3>
          </div>
        </div>
      </div>
      <div className="bg-purple-400 p-0.5 rounded-b-lg"></div>
    </div>
  ))}
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
