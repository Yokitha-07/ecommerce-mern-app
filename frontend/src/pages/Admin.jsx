export default function Admin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl">Admin Dashboard</h1>

      <ul className="mt-4 space-y-2">
        <li>Manage Users</li>
        <li>Manage Products</li>
        <li>Manage Orders</li>
        <li>Manage Promos</li>
      </ul>
    </div>
  );
}