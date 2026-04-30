import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

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
  title: "Saral AI",
  description: "Legal Investigation Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable}`}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", padding: "32px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}