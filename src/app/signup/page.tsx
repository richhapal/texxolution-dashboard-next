"use client";

import { useRegisterMutation } from "@/_lib/rtkQuery/authRTKQuery";
import { Alert, Button, Input, user } from "@heroui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    name: "",
    userType: "admin", // Default userType for admin registration
  });
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full max-w-md mx-auto mt-10 p-6 ">
      <div className="text-2xl font-bold w-full text-center mb-7">
        Welcome to Admin
      </div>
      <div className="flex flex-col w-full  md:flex-nowrap gap-4">
        {error && <Alert description={error} title={"Alert"} color="danger" />}
        <Input
          name="name"
          onChange={handleChange}
          isRequired
          label="Full Name"
          type="text"
          value={auth.name}
        />
        <Input
          name="email"
          onChange={handleChange}
          isRequired
          label="Email"
          type="email"
          value={auth.email}
        />
        <Input
          name="password"
          onChange={handleChange}
          isRequired
          label="Password"
          type="password"
          value={auth.password}
          description="Password must be at least 8 characters long"
        />
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          onClick={handleSubmit}
          color="primary"
          size="sm"
          className="text-white"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
        <div>
          Already have an account?{" "}
          <a href="/dashboard/signin" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
