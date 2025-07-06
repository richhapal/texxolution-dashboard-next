import Script from "next/script";
import { ReactNode } from "react";

export default function AddProductLayout({
  children,
}: {
  children: ReactNode;
}) {
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
