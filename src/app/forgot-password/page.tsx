"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Spinner,
  Alert,
} from "@heroui/react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useForgotPasswordMutation } from "@/_lib/rtkQuery/authRTKQuery";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // State
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "success" | "error">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // RTK Query hook
  const [forgotPassword] = useForgotPasswordMutation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await forgotPassword({
        email: email.trim(),
      }).unwrap();

      if (response.success) {
        setStep("success");
        setSuccessMessage(
          response.message || "Password reset email sent successfully!"
        );
      } else {
        setErrorMessage(response.message || "Failed to send reset email.");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToLogin = () => {
    router.push("/signin");
  };

  const handleTryAgain = () => {
    setStep("request");
    setEmail("");
    setErrorMessage("");
    setSuccessMessage("");
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
      </div>

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
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Forgot Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {step === "request" && "Enter your email to receive a reset link"}
            {step === "success" && "Check your email for reset instructions"}
            {step === "error" && "Something went wrong"}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardBody className="p-6 sm:p-8">
            {/* Request Step */}
            {step === "request" && (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {errorMessage && (
                  <Alert color="danger" className="mb-4">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </Alert>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    startContent={<Mail className="w-4 h-4 text-gray-400" />}
                    size="lg"
                    disabled={isLoading}
                    className="mb-3 sm:mb-4"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Enter the email address associated with your account and
                    we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!email.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 min-h-[48px] touch-manipulation"
                  startContent={!isLoading && <Send className="w-4 h-4" />}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={handleGoToLogin}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Back to Login
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Check Your Email
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-gray-900 break-all">
                    {email}
                  </span>
                </p>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                    What&apos;s next?
                  </h4>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1 text-left">
                    <li>1. Check your email inbox</li>
                    <li>2. Click the reset link in the email</li>
                    <li>3. Create your new password</li>
                    <li>4. Login with your new password</li>
                  </ul>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    color="primary"
                    size="lg"
                    onClick={handleTryAgain}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 min-h-[48px] touch-manipulation"
                  >
                    Send Another Email
                  </Button>
                  <Button
                    variant="light"
                    size="lg"
                    onClick={handleGoToLogin}
                    className="w-full min-h-[48px] touch-manipulation"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Something Went Wrong
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  {errorMessage ||
                    "We couldn't send the reset email. Please try again."}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    color="primary"
                    size="lg"
                    onClick={handleTryAgain}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 min-h-[48px] touch-manipulation"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="light"
                    size="lg"
                    onClick={handleGoToLogin}
                    className="w-full min-h-[48px] touch-manipulation"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          <p>
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={handleTryAgain}
              className="text-blue-600 hover:text-blue-800 underline touch-manipulation"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
