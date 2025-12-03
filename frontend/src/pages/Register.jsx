import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react";

export default function RegisterUserPage() {
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
    site: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess("")
    setError("")

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("User registered successfully!")
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "User",
          site: "",
        })
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Create User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  role: value,
                  site: value === "Admin" ? "" : prev.site,
                }));
              }}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Site (only for User) */}
          {formData.role === "User" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <select
                name="site"
                value={formData.site}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="">Select Site</option>
                <option value="Insignia Park-1">Insignia Park-1</option>
                <option value="Insignia Park-2">Insignia Park-2</option>
                <option value="Pravasa">Pravasa</option>
                <option value="Sukoon">Sukoon</option>
                <option value="I-City">I-City</option>
                <option value="Ambliss">Ambliss</option>
                <option value="Ananda">Ananda</option>
                <option value="Dlf Phase-1">Dlf Phase-1</option>
                <option value="Wazirpur">Wazirpur</option>
                <option value="Hayatpur">Hayatpur</option>
                <option value="Head Office">Head Office</option>
              </select>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition disabled:bg-blue-400"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  )
}
