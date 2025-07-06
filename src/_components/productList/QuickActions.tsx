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
    <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 rounded-2xl backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Common tasks and shortcuts for product management
          </p>
        </div>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="hover:shadow-md transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50 hover:ring-gray-300/50 hover:-translate-y-1 touch-manipulation active:scale-95"
            isPressable
            onPress={action.action}
          >
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 sm:p-2.5 bg-gradient-to-br from-${action.color}-100 to-${action.color}-200/70 rounded-lg sm:rounded-xl shadow-sm`}
                >
                  {React.cloneElement(action.icon, {
                    className: `w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-600`,
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {action.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-0.5">
                    {action.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-bold">→</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
