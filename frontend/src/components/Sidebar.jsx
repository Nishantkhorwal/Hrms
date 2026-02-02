import { useState } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  LogOut,
  Settings,
  UserPlus,
  UserCheck,
  UserMinus,
  ListChecks
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "Admin";
  const isSuperAdmin = user.role === "SuperAdmin";
  const isUser = user.role === "User";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {!isOpen && (
        <button onClick={toggleSidebar} className="fixed rounded-full top-2 left-2 z-50 bg-blue-800 px-2 py-2 text-white">
          <FiChevronRight />
        </button>
      )}

      <div
        className={`bg-[#011638] fixed top-0 left-0 z-40 min-h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0'
          }`}
      >
        <div className={`flex h-16 ${isOpen ? 'border-b border-gray-700' : ''} justify-between items-center px-4 py-4`}>
          {isOpen ? (
            <h2 className="text-xl text-white font-bold flex items-center gap-2">
              ROF
            </h2>
          ) : (
            <button onClick={toggleSidebar} className="text-2xl text-white w-10">
              <FiChevronRight />
            </button>
          )}
          {isOpen && (
            <button onClick={toggleSidebar} className="text-2xl text-white w-10">
              <FiChevronLeft />
            </button>
          )}
        </div>

        {isOpen && (
          <ul className="mt-4 px-4 space-y-2">

            {/* Admin-only routes */}
            {isAdmin && (
              <>
                <li>
                  <Link to="/">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/extraPerson">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Request
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/settings">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </button>
                  </Link>
                </li>
              </>
            )}

            {/* SuperAdmin */}
            {isSuperAdmin && (
              <>
                <li>
                  <Link to="/">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/register">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/createSiteLimit">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <ListChecks className="mr-2 h-4 w-4" />
                      Site Limit
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to="/createAsset">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register Asset
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to="/issueAsset">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Asset Management
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/settings">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </button>
                  </Link>
                </li>
              </>
            )}

            {/* User */}
            {isUser && (
              <>
                <li>
                  <Link to="/">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Add Entry
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/pending-out">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserMinus className="mr-2 h-4 w-4" />
                      Mark Out Time
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/createExtra">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Extra Employee
                    </button>
                  </Link>
                </li>

                <li>
                  <Link to="/settings">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </button>
                  </Link>
                </li>
              </>
            )}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-100 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </li>

          </ul>
        )}
      </div>
    </>
  );
}
