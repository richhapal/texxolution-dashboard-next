import React from "react";
import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Layers,
  Settings,
  Upload,
  Download,
  BarChart3,
} from "lucide-react";

export default function QuickActions() {
  const router = useRouter();

  const quickActions = [
    {
      id: "add-product",
      title: "Add New Product",
      description: "Create a new product listing",
      icon: <Package className="w-5 h-5" />,
      color: "blue",
      action: () => router.push("/productList/add"),
    },
    {
      id: "manage-categories",
      title: "Manage Categories",
      description: "Edit category settings",
      icon: <Layers className="w-5 h-5" />,
      color: "green",
      action: () => router.push("/category-list"),
    },
    {
      id: "bulk-operations",
      title: "Bulk Operations",
      description: "Import/export products",
      icon: <Settings className="w-5 h-5" />,
      color: "purple",
      action: () => console.log("Bulk operations - Coming soon!"),
    },
    {
      id: "import-products",
      title: "Import Products",
      description: "Upload CSV/Excel files",
      icon: <Upload className="w-5 h-5" />,
      color: "orange",
      action: () => console.log("Import products - Coming soon!"),
    },
    {
      id: "export-products",
      title: "Export Products",
      description: "Download product data",
      icon: <Download className="w-5 h-5" />,
      color: "teal",
      action: () => console.log("Export products - Coming soon!"),
    },
    {
      id: "analytics",
      title: "Product Analytics",
      description: "View detailed reports",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "indigo",
      action: () => console.log("Analytics - Coming soon!"),
    },
  ];

  return (
    <div className="mt-12 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            isPressable
            onPress={action.action}
          >
            <CardBody className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                  {React.cloneElement(action.icon, {
                    className: `w-5 h-5 text-${action.color}-600`,
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
