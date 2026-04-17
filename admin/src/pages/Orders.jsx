import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const formatOrderDate = (value) => {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };



  const statusHandler = async (event, orderId)=> {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', {orderId, status: event.target.value}, {headers: {token}})
      if (response.data.success){
        await fetchAllOrders();
      }
    } catch (error){
      console.log(error);
      toast.error(error.message);
    }
  }

  const removeOrderHandler = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    const orderInfo = order ? `Order #${order._id.slice(-6)}` : 'this order';
    const confirmed = window.confirm(`Are you sure you want to remove ${orderInfo}? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/remove', {orderId}, {headers: {token}})
      if (response.data.success){
        toast.success(response.data.message);
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error){
      console.log(error);
      toast.error(error.message);
    }
  }

  const paymentStatusHandler = async (orderId, currentPaymentStatus) => {
    try {
      const newPaymentStatus = !currentPaymentStatus;
      const response = await axios.post(backendUrl + '/api/order/payment-status', {orderId, payment: newPaymentStatus}, {headers: {token}})
      if (response.data.success){
        toast.success(response.data.message);
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error){
      console.log(error);
      toast.error(error.message);
    }
  }

  const formatDimensions = (dimensions) => {
    if (!dimensions) return "N/A";
    const parts = String(dimensions).toLowerCase().split("x");
    if (parts.length === 3) {
      return `${parts[0]}×${parts[1]}×${parts[2]} cm`;
    }
    return String(dimensions);
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => (
          <div className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 " key={index}>
            <img className="w-12" src={assets.parcel_icon} alt="parcel_icon" />
            <div>
              <div>
                {order.items.map((item, idx) => (
                  <p className="py-0.5" key={idx}>
                    {item.name} × {item.quantity}{" "}
                    <span className="text-gray-500">
                      ({formatDimensions(item.dimensions)})
                    </span>
                  </p>
                ))}
              </div>

              <p className="mt-3 mb-2 font-medium">{order.address.firstName + " " + order.address.lastName}</p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>

              <p>{order.address.phone}</p>
            </div>

              <div>
                <p className="text-sm sm:text-[15px]">Items : {order.items.length}</p>
                <p className="mt-3">Method : {order.paymentMethod}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p>Payment :</p>
                  <button
                    onClick={() => paymentStatusHandler(order._id, order.payment)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      order.payment 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {order.payment ? 'Done' : 'Mark as Done'}
                  </button>
                </div>
                <p className="mt-2">Date & Time: {formatOrderDate(order.date)}</p>
              </div>


              <div className="flex flex-col gap-3">
                <p className="text-sm sm:text-[15px]">{currency}{order.amount}</p>
                <select onChange={(event)=>statusHandler(event, order._id)} value={order.status} className="p-2 font-semibold">
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={() => removeOrderHandler(order._id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors"
                >
                  Remove Order
                </button>
              </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
