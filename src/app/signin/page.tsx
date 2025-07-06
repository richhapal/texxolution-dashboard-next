"use client";

import { Alert, Button, Input, Checkbox } from "@heroui/react";
import { useState, useEffect } from "react";
import { useLoginMutation } from "@/_lib/rtkQuery/authRTKQuery";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";
import { encryptPassword, decryptPassword } from "@/_lib/utils/encryption";
import { Eye, EyeOff, Mail, Lock, Shield, LogIn } from "lucide-react";
import Link from "next/link";

const SignInPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saveCredentials, setSaveCredentials] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedEncryptedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedEncryptedPassword) {
      const decryptedPassword = decryptPassword(savedEncryptedPassword);
      setAuth({
        email: savedEmail,
        password: decryptedPassword,
      });
      setSaveCredentials(true);
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSaveCredentialsChange = (checked: boolean) => {
    setSaveCredentials(checked);

    // If unchecked, remove saved credentials from localStorage
    if (!checked) {
      localStorage.removeItem("savedEmail");
      localStorage.removeItem("savedPassword");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!auth.email || !auth.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      dispatch(loginStart());

      const response = await login({
        email: auth.email,
        password: auth.password,
      }).unwrap();

      // Check if login was successful
      if (response.isLoggedIn === false) {
        // Handle failed login with 200 status
        const errorMessage = response.message || "Login failed";
        setError(errorMessage);
        dispatch(loginFailure(errorMessage));
        return;
      }

      // Ensure we have a token
      if (!response.tokens?.token) {
        const errorMessage = "No token received from server";
        setError(errorMessage);
        dispatch(loginFailure(errorMessage));
        return;
      }

      // Store token in cookie only if login is successful
      const token = response.tokens.token;
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      // Save credentials to localStorage if checkbox is checked
      if (saveCredentials) {
        localStorage.setItem("savedEmail", auth.email);
        localStorage.setItem("savedPassword", encryptPassword(auth.password));
      }

      // If user data is in response, use it; otherwise use basic user info
      const userData = response.loginAdmin;
      console.log("Token stored in cookie:", token, userData);
      if (userData) {
        dispatch(
          loginSuccess({
            user: userData,
            token: token,
          })
        );

        // Redirect to dashboard
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error?.data?.message || "Login failed";
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6 animate-fade-in">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to your admin dashboard
            </p>
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
                        Login Failed
                      </h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Input
                  name="email"
                  value={auth.email}
                  onChange={handleChange}
                  isRequired
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  startContent={<Mail className="w-5 h-5 text-gray-400" />}
                  className="bg-white/80 backdrop-blur-sm"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper:
                      "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-400 group-data-[focus=true]:border-blue-500",
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                      "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-400 group-data-[focus=true]:border-blue-500",
                  }}
                />
              </div>

              {/* Save Credentials Checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50">
                <Checkbox
                  isSelected={saveCredentials}
                  onValueChange={handleSaveCredentialsChange}
                  className="text-blue-600"
                  classNames={{
                    wrapper: "before:border-blue-300 after:bg-blue-500",
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    Save credentials
                  </span>
                  <span className="text-xs text-gray-500">
                    Are you sure you trust this device?
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                startContent={!isLoading && <LogIn className="w-5 h-5" />}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-purple-600 font-medium hover:underline transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-purple-600 font-semibold hover:underline transition-colors duration-300"
                >
                  Sign Up
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

export default SignInPage;
