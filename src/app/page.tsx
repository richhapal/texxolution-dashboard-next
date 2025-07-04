"use client";

import React from "react";
import { Card, CardBody, CardFooter, Button, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  FolderIcon,
  List,
  Menu,
  ScrollText,
  Settings2,
  UsersRound,
  KeyRound as UserLock,
} from "lucide-react";
import MenuIcon from "@/_lib/svgIcons/menuIcon";
import OrderListIcon from "@/_lib/svgIcons/orderList";
import UserIcon from "@/_lib/svgIcons/user";
import SettingIcon from "@/_lib/svgIcons/setting";
import KeyIcon from "@/_lib/svgIcons/keyIcon";
import Link from "next/link";

const pages = [
  {
    name: "Product List",
    path: "/productList",
    description: "Manage your product catalog",
    icon: <MenuIcon />,
  },
  {
    name: "Order List",
    path: "/orderList",
    description: "Track and manage customer orders",
    icon: <OrderListIcon />,
  },
  {
    name: "Customer List",
    path: "/customerList",
    description: "View and manage customer information",
    icon: <UserIcon />,
  },
  {
    name: "Image Upload",
    path: "/image-upload",
    description: "Upload images to AWS S3",
    icon: <FolderIcon />,
  },
  {
    name: "Setting",
    path: "/setting",
    description: "Configure your store settings",
    icon: <SettingIcon />,
  },
  {
    name: "Permissions",
    path: "/permissions",
    description: "Manage user permissions",
    icon: <KeyIcon />,
  },
];

export default function PageDirectory() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pages.map((page) => (
          <Link key={page.path} href={page.path} className="no-underline">
            <Card
              key={page.path}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full"
            >
              <CardHeader className="">
                {page.icon ? (
                  React.cloneElement(page.icon, {
                    className: "",
                  })
                ) : (
                  <FolderIcon className="" />
                )}
              </CardHeader>
              <CardFooter className="flex flex-col items-start">
                <h2 className="text-base font-semibold mb-2">{page.name}</h2>
                <div className="text-[#6B7582] text-sm font-normal">
                  {page.description}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
