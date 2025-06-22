"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@heroui/react";

export default function Header() {
  const currentDate = new Date();
  // const formattedDate = currentDate.toLocaleDateString("en-US", {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "short",
  //   year: "numeric",
  // });

  return (
    <header className="w-full border-b bg-white">
      <div className=" w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#CE1345]">Tex</span>
            <span className="text-black">xolutions</span>
            {/* <span className="text-[#F5FDC0]">xolution </span>Admin */}
          </Link>
          <span className="text-muted-foreground text-[#83D6F3]">|</span>
          <span className="text-[#0087B7]">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/signin">
            <Button color="primary" variant="light" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button color="secondary" variant="flat" size="sm">
              Sign Up
            </Button>
          </Link>

          {/* <Button
            color="danger"
            variant="light"
            size="sm"
            className="text-black"
          >
            Log Out
          </Button> */}
        </div>
        {/* <div className="text-sm text-muted-foreground">{formattedDate}</div> */}
      </div>

      {/* <div className="h-10 w-full bg-gradient-to-r from-blue-200 via-pink-200 via-yellow-200 to-purple-200" /> */}
    </header>
  );
}
