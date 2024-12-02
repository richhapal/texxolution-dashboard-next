"use client";

import React from "react";
import { Card, CardBody, CardFooter, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FolderIcon } from "lucide-react";

const pages = [
  { name: "Category List", path: "/category-list" },
  { name: "Job List by Category", path: "/job-list" },
  { name: "Add New Job", path: "/add" },
  // Add more pages here as needed
];

export default function PageDirectory() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Page Directory</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pages.map((page) => (
          <Card
            key={page.path}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardBody className="flex items-center justify-center">
              <FolderIcon className="w-12 h-12 text-primary" />
            </CardBody>
            <CardFooter className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{page.name}</h2>
              <Button
                color="primary"
                variant="flat"
                onPress={() => router.push(page.path)}
              >
                Open
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
