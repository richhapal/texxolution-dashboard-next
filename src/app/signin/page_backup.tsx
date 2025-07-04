"use client";

import { Alert, Button, Input, Checkbox } from "@heroui/react";
import { useState, useEffect } from "react";
import { useLoginMutation } from "@/_lib/rtkQuery/authRTKQuery";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saveCredentials, setSaveCredentials] = useState<boolean>(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    
    if (savedEmail && savedPassword) {
      setAuth({
        email: savedEmail,
        password: savedPassword,
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
        localStorage.setItem("savedPassword", auth.password);
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
    <div className="w-full max-w-md mx-auto mt-10 p-6">
      <div className="text-2xl font-bold w-full text-center mb-7">
        Welcome to Admin
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col w-full md:flex-nowrap gap-4">
        {error && <Alert description={error} title={"Alert"} color="danger" />}
        
        <Input
          name="email"
          value={auth.email}
          onChange={handleChange}
          isRequired
          label="Email"
          type="email"
          autoComplete="email"
        />
        
        <Input
          name="password"
          value={auth.password}
          onChange={handleChange}
          isRequired
          label="Password"
          type="password"
          autoComplete="current-password"
        />

        <Checkbox
          isSelected={saveCredentials}
          onValueChange={handleSaveCredentialsChange}
          className="mb-2"
        >
          Save credentials
        </Checkbox>
        
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          color="primary"
          size="sm"
          className="text-white"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
        
        <div className="text-center">
          Don&#39;t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
};
export default SignInPage;
