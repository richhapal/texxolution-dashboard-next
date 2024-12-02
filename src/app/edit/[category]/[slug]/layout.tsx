import Script from "next/script";
import { ReactNode } from "react";

{
  /* <script src="https://assets.geeksforgeeks.org/tinymce/5.10.9/tinymce.min.js"></script>; */
}
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        src="https://assets.geeksforgeeks.org/tinymce/5.10.9/tinymce.min.js"
        strategy="beforeInteractive"
      />
      <>{children}</>
    </>
  );
}
