import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "/contact", label: "Contact Us" },
    // { href: "/work-with-us", label: "Work With Us" },
    { href: "/advertise", label: "Advertise" },
    // { href: "/ad-choices", label: "Your Ad Choices" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms of Service" },
    // { href: "/terms-of-sale", label: "Terms of Sale" },
    { href: "/site-info", label: "Site Information" },
    // { href: "/navigation", label: "Navigation" },
    // { href: "/sitemap", label: "Site Map" },
    // { href: "/help", label: "HelpSite" },
    { href: "/feedback", label: "Feedback" },
    // { href: "/subscriptions", label: "Subscriptions" },
  ];

  return (
    <footer className="w-full border-t bg-white py-4">
      <div className="w-full px-4">
        <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium">© {currentYear} frejobalert.com</span>

          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
