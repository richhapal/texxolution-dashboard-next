"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@nextui-org/react";

export default function Header() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="w-full border-b bg-white">
      <div className=" w-full flex h-16 items-center justify-between px-4">
        <Button
          variant="ghost"
          className="md:hidden"
          startContent={<Menu className="h-5 w-5" />}
        >
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="hidden md:flex md:gap-2">
          <Button variant="ghost" size="sm" className="font-semibold">
            <Menu className="mr-2 h-5 w-5" />
            MENU
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold text-[#132D6B]">
            freejobalert.com
          </Link>
          <span className="text-muted-foreground text-[#83D6F3]">|</span>
          <span className="text-[#0087B7]">Dashboard</span>
        </div>

        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="h-10 w-full bg-gradient-to-r from-blue-200 via-pink-200 via-yellow-200 to-purple-200" />
    </header>
  );
}
