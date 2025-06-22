"use client";

import { useRegisterMutation } from "@/_lib/rtkQuery/authRTKQuery";
import { Button, Input } from "@heroui/react";
import { useState } from "react";

const SignUpPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    name: "",
  });
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
  };

  const [register, { isLoading, error }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    register(auth)
      .unwrap()
      .then((response) => {
        console.log("Registration successful:", response);
        // Handle success, e.g., redirect to login or dashboard
      })
      .catch((err) => {
        console.error("Registration failed:", err);
        // Handle error, e.g., show error message
      });
    // If you want to use the register mutation directly, you can do so like this:
    // await register(auth);
    // Handle success/error as needed
  };
  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 ">
      <div className="text-2xl font-bold w-full text-center mb-7">
        Welcome to Admin
      </div>
      <div className="flex flex-col w-full  md:flex-nowrap gap-4">
        <Input
          name="email"
          onChange={handleChange}
          isRequired
          label="Email"
          type="email"
        />
        <Input
          name="name"
          onChange={handleChange}
          isRequired
          label="Full Name"
          type="text"
        />
        <Input
          name="password"
          onChange={handleChange}
          isRequired
          label="Password"
          type="password"
        />
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          onClick={handleSubmit}
          color="primary"
          size="sm"
          className="text-white"
        >
          Create Account
        </Button>
        <div>
          Already have an account?{" "}
          <a href="/dashboard/signin" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </div>
        <div className="flex flex-col w-full">
          {/* {["default", "primary", "secondary", "success", "warning", "danger"].map((color) => (
          <div key={color} className="w-full flex items-center my-3">
            <Alert color={color} title={`This is a ${color} alert`} />
          </div>
        ))} */}
        </div>
        {/* <Input label="Email" placeholder="Enter your email" type="email" /> */}
      </div>
    </div>
  );
};
export default SignUpPage;
