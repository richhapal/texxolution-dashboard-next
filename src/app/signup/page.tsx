"use client";

import { useRegisterMutation } from "@/_lib/rtkQuery/authRTKQuery";
import { Alert, Button, Input } from "@heroui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Shield, UserPlus } from "lucide-react";
import Link from "next/link";

const SignUpPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    name: "",
    userType: "admin", // Default userType for admin registration
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!auth.email || !auth.password || !auth.name) {
      setError("Please fill in all fields");
      return false;
    }

    if (auth.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(auth.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await register(auth).unwrap();

      console.log("Registration successful:", response);

      // Check if registration was successful
      if (response.isLoggedIn === false) {
        // Handle failed registration with 200 status (e.g., email already exists)
        const errorMessage = response.message || "Registration failed";
        setError(errorMessage);
        return;
      }

      // Store token in cookie
      const token = response.tokens?.token;
      if (token && response.newAdmin) {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

        // Update Redux store with user data
        dispatch(
          loginSuccess({
            user: {
              id: response.newAdmin._id,
              email: response.newAdmin.email,
              name: response.newAdmin.name,
              userType: response.newAdmin.userType,
              permissions: response.newAdmin.permissions || [],
            },
            token: token,
          })
        );

        // Redirect to dashboard
        router.push("/");
      } else {
        // Registration successful but no token, redirect to signin
        router.push("/signin");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-2xl mb-6 animate-fade-in">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-lg">Join our admin dashboard</p>
          </div>

          {/* Form Container */}
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50/90 to-rose-50/90 rounded-2xl border border-red-200/50 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">
                        Registration Failed
                      </h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name Input */}
              <div className="space-y-2">
                <Input
                  name="name"
                  value={auth.name}
                  onChange={handleChange}
                  isRequired
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  startContent={<User className="w-5 h-5 text-gray-400" />}
                  className="bg-white/80 backdrop-blur-sm"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper:
                      "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-emerald-400 group-data-[focus=true]:border-emerald-500",
                  }}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Input
                  name="email"
                  value={auth.email}
                  onChange={handleChange}
                  isRequired
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  startContent={<Mail className="w-5 h-5 text-gray-400" />}
                  className="bg-white/80 backdrop-blur-sm"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper:
                      "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-emerald-400 group-data-[focus=true]:border-emerald-500",
                  }}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Input
                  name="password"
                  value={auth.password}
                  onChange={handleChange}
                  isRequired
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  description="Password must be at least 8 characters long"
                  startContent={<Lock className="w-5 h-5 text-gray-400" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  }
                  className="bg-white/80 backdrop-blur-sm"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper:
                      "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-emerald-400 group-data-[focus=true]:border-emerald-500",
                  }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                startContent={!isLoading && <UserPlus className="w-5 h-5" />}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-emerald-600 hover:text-teal-600 font-semibold hover:underline transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2025 Admin Dashboard. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
