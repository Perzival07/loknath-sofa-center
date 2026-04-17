import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/order/stats`,
          {},
          { headers: { token } }
        );
        if (!cancelled && data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard…</p>;
  }

  if (!stats) {
    return <p className="text-gray-500">Could not load statistics.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total sales</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {currency}
            {Number(stats.totalSales || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Orders by status</h3>
          <ul className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {(stats.ordersByStatus || []).map((row) => (
              <li
                key={row._id || "unknown"}
                className="flex justify-between px-4 py-2 text-sm"
              >
                <span>{row._id || "—"}</span>
                <span className="font-medium">{row.count}</span>
              </li>
            ))}
            {(!stats.ordersByStatus || stats.ordersByStatus.length === 0) && (
              <li className="px-4 py-3 text-sm text-gray-500">No order data</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Recent orders</h3>
          <ul className="bg-white rounded border border-gray-200 divide-y divide-gray-100 text-sm">
            {(stats.recentOrders || []).map((o) => (
              <li key={o._id} className="px-4 py-2 flex flex-col gap-0.5">
                <span className="font-medium text-gray-800">
                  {currency}
                  {o.amount} · {o.status}
                </span>
                <span className="text-gray-500 text-xs">{String(o.date)}</span>
              </li>
            ))}
            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
              <li className="px-4 py-3 text-gray-500">No recent orders</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
