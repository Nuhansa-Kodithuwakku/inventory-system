import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "InventoryPro",
  description: "Inventory Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />

          <main className="flex-1 bg-gray-100 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
