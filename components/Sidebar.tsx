import Link from "next/link";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Suppliers", href: "/suppliers" },
  { name: "Inventory", href: "/inventory" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-10">InventoryPro</h1>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg p-3 hover:bg-slate-700"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
