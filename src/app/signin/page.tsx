"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";

const SignInPage = () => {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
  };

  console.log("auth", auth);
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
          name="password"
          onChange={handleChange}
          isRequired
          label="Password"
          type="password"
        />
        <Button color="primary" size="sm" className="text-white">
          Sign In
        </Button>
        <div>
          Don&#39;t have an account?{" "}
          <a href="/dashboard/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </div>
        {/* <Input label="Email" placeholder="Enter your email" type="email" /> */}
      </div>
    </div>
  );
};
export default SignInPage;
