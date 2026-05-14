import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Saral AI",
  description: "Legal Investigation Platform",
};

export default function SaralAILayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}