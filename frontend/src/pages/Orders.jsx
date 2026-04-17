import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const formatOrderDate = (value) => {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders([...(response.data.orders || [])].reverse());
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading order data:", error);
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message || "Order cancelled successfully");
        await loadOrderData();
      } else {
        toast.error(data.message || "Could not cancel order");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const canCancel = (status) =>
    status === "Order Placed" || status === "Packing";

  return (
    <div className="border-t pt-16">
      <div className="text-2xl flex flex-wrap items-center justify-between gap-4">
        <Title text1={"MY"} text2={"ORDERS"} />
        <button
          type="button"
          onClick={loadOrderData}
          className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div>
        {orders.map((order) => (
          <div
            key={order._id}
            className="py-6 border-b text-gray-700 flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <p>
                Date:{" "}
                <span className="text-gray-800">{formatOrderDate(order.date)}</span>
              </p>
              <p>
                Total:{" "}
                <span className="text-gray-800 font-medium">
                  {currency}
                  {order.amount}
                </span>
              </p>
              <p>
                Payment:{" "}
                <span className="text-gray-800">{order.paymentMethod}</span>
              </p>
            </div>

            {order.items.map((item, idx) => (
              <div
                key={`${order._id}-${idx}`}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-6 text-sm">
                  <img
                    loading="lazy"
                    className="w-16 sm:w-20"
                    src={item.image[0]}
                    alt="item_image"
                  />

                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                      <p>
                        {currency}
                        {item.price}
                      </p>
                      <p>Quantity: {item.quantity}</p>
                      {item.dimensions && (() => {
                        const dims = item.dimensions.split("x");
                        const formatDim = (cm) => {
                          const totalInches = Number(cm) / 2.54;
                          const feet = Math.floor(totalInches / 12);
                          const inches =
                            Math.round((totalInches % 12) * 10) / 10;
                          return {
                            cm: Math.round(Number(cm)),
                            feet,
                            inches,
                          };
                        };
                        const length = formatDim(dims[0]);
                        const breadth = formatDim(dims[1]);
                        const height = formatDim(dims[2]);
                        const imperial = `${length.feet}'${length.inches}"×${breadth.feet}'${breadth.inches}"×${height.feet}'${height.inches}"`;
                        return (
                          <p>
                            Dimensions: {length.cm}×{breadth.cm}×{height.cm} cm (
                            {imperial})
                          </p>
                        );
                      })()}
                      {!item.dimensions && <p>Dimensions: N/A</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm md:text-base font-medium">{order.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {canCancel(order.status) ? (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(order._id)}
                    className="border border-red-500 text-red-500 px-4 py-2 text-sm font-medium rounded-sm hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Cancel order
                  </button>
                ) : order.status === "Cancelled" ? (
                  <p className="text-red-500 text-sm font-medium">Cancelled</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
