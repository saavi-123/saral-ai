import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "700"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500"]
});

export const metadata = {
  title: "Cyber AI Agent",
  description: "Law Enforcement Intelligence Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}