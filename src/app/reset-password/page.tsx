"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Spinner,
  Alert,
} from "@heroui/react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  useVerifyResetTokenMutation,
  useResetPasswordMutation,
} from "@/_lib/rtkQuery/authRTKQuery";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const token = searchParams.get("token");
  const userType = searchParams.get("userType");

  // State
  const [step, setStep] = useState<"verifying" | "reset" | "success" | "error">(
    "verifying"
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // RTK Query hooks
  const [verifyResetToken] = useVerifyResetTokenMutation();
  const [resetPassword] = useResetPasswordMutation();

  // Ref to track if verification has been initiated to prevent double calls
  const verificationInitiated = useRef(false);

  // Validate password requirements
  useEffect(() => {
    if (password) {
      setPasswordValidation({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !userType) {
        setStep("error");
        setErrorMessage("Invalid reset link. Token or user type is missing.");
        return;
      }

      // Check if verification has already been initiated
      if (verificationInitiated.current) {
        return;
      }

      // Mark verification as initiated
      verificationInitiated.current = true;

      try {
        const response = await verifyResetToken({
          token,
          type: userType,
        }).unwrap();

        console.log("response", response);

        if (response.valid) {
          setStep("reset");
        } else {
          setStep("error");
          setErrorMessage(
            response.message || "Invalid or expired reset token."
          );
        }
      } catch (error: any) {
        console.log('setStep("error")', error);
        setStep("error");

        // Handle different error response structures
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to verify reset token. Please try again.";
        setErrorMessage(errorMessage);
      }
    };

    // Only run if we haven't already started verification
    if (step === "verifying") {
      verifyToken();
    }
  }, [token, userType, step, verifyResetToken]);

  // Reset loading states when step changes from verifying
  useEffect(() => {
    if (step !== "verifying") {
      setIsLoading(false);
    }
  }, [step]);

  // Additional failsafe: if we're in verifying step for too long, show error
  useEffect(() => {
    if (step === "verifying") {
      const timeout = setTimeout(() => {
        if (step === "verifying") {
          setStep("error");
          setErrorMessage("Verification timed out. Please try again.");
        }
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [step]);

  const handleResetPassword = async () => {
    if (!token) return;

    // Validate passwords
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      setErrorMessage("Password does not meet all requirements.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await resetPassword({
        token,
        newPassword: password,
      }).unwrap();

      if (response.success) {
        setStep("success");
        setSuccessMessage(response.message || "Password reset successfully!");
      } else {
        setErrorMessage(response.message || "Failed to reset password.");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/signin");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-pink-400/10 to-violet-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-float opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float opacity-70"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>{" "}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-md sm:max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Button
            variant="light"
            isIconOnly
            onClick={handleGoBack}
            className="absolute left-3 sm:left-4 top-3 sm:top-4 hover:scale-110 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg min-w-10 h-10 sm:min-w-12 sm:h-12 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl animate-pulse">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {step === "verifying" && "Verifying your reset token..."}
            {step === "reset" && "Create your new password"}
            {step === "success" && "Password reset successful!"}
            {step === "error" && "Reset link is invalid or expired"}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardBody className="p-6 sm:p-8">
            {/* Verifying Step */}
            {step === "verifying" && (
              <div className="text-center py-6 sm:py-8">
                <Spinner size="lg" className="mb-4" />
                <p className="text-sm sm:text-base text-gray-600">
                  Verifying your reset token, please wait...
                </p>
              </div>
            )}

            {/* Reset Password Step */}
            {step === "reset" && (
              <div className="space-y-6">
                {errorMessage && (
                  <Alert color="danger" className="mb-4">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </Alert>
                )}

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    startContent={<Lock className="w-4 h-4 text-gray-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    }
                    className="mb-3"
                  />

                  {/* Password Requirements */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            passwordValidation.length
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            passwordValidation.length
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            passwordValidation.uppercase
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            passwordValidation.uppercase
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            passwordValidation.lowercase
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            passwordValidation.lowercase
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            passwordValidation.number
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            passwordValidation.number
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          One number
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            passwordValidation.special
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            passwordValidation.special
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    startContent={<Lock className="w-4 h-4 text-gray-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    }
                    color={
                      confirmPassword && password !== confirmPassword
                        ? "danger"
                        : "default"
                    }
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Reset Button */}
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleResetPassword}
                  isLoading={isLoading}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    !Object.values(passwordValidation).every(Boolean)
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Password Reset Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  {successMessage ||
                    "Your password has been reset successfully."}
                </p>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Reset Link Invalid
                </h3>
                <p className="text-gray-600 mb-6">
                  {errorMessage || "The reset link is invalid or has expired."}
                </p>
                <div className="space-y-3">
                  <Button
                    color="primary"
                    size="lg"
                    onClick={() => router.push("/forgot-password")}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Request New Reset Link
                  </Button>
                  <Button
                    variant="light"
                    size="lg"
                    onClick={handleGoToLogin}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Having trouble?{" "}
            <button
              onClick={() => router.push("/signin")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
