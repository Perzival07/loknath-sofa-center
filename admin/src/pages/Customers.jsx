import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/user/customers",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setCustomers(response.data.customers);
      } else {
        toast.error(response.data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatAddress = (profile) => {
    if (!profile?.address) return "Not provided";
    
    const addr = profile.address;
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipcode,
      addr.country
    ].filter(Boolean); // Remove empty strings
    
    if (parts.length === 0) return "Not provided";
    
    // Join parts with comma and space
    let addressString = parts.join(", ");
    
    // Capitalize first letter of the entire string
    addressString = addressString.charAt(0).toUpperCase() + addressString.slice(1);
    
    // Capitalize first letter after each punctuation mark (comma, period, etc.)
    addressString = addressString.replace(/([,.!?;:])\s*([a-z])/g, (match, punctuation, letter) => {
      return punctuation + " " + letter.toUpperCase();
    });
    
    return addressString;
  };

  const formatDate = (dateString, objectId) => {
    let date;
    if (dateString) {
      date = new Date(dateString);
    } else if (objectId) {
      // Use ObjectId timestamp as fallback (ObjectId contains creation timestamp)
      try {
        // Extract timestamp from MongoDB ObjectId (first 4 bytes are timestamp)
        const timestamp = parseInt(objectId.toString().substring(0, 8), 16) * 1000;
        date = new Date(timestamp);
      } catch {
        return "N/A";
      }
    } else {
      return "N/A";
    }
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const removeCustomer = async (customerId, customerName) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to remove "${customerName}"?\n\n` +
      `This action will permanently delete the customer and all their data. ` +
      `This action CANNOT be undone.\n\n` +
      `Click OK to proceed or Cancel to abort.`
    );

    if (!confirmed) {
      return; // User cancelled the deletion
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/user/remove-customer',
        { customerId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Customer removed successfully');
        await fetchCustomers(); // Refresh the list after deletion
      } else {
        toast.error(response.data.message || 'Failed to remove customer');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to remove customer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-xl font-semibold">All Customers</p>
      <p className="mb-6 text-sm text-gray-500">Total Customers: {customers.length}</p>

      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_2fr_2fr_1fr_1fr] items-center py-2 px-4 border bg-gray-100 text-sm font-semibold">
          <b>Name</b>
          <b>Email</b>
          <b>Phone</b>
          <b>Address</b>
          <b>Joined Date</b>
          <b className="text-center">Action</b>
        </div>

        {/* Customers List */}
        {customers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No customers found.</p>
          </div>
        ) : (
          customers.map((customer, index) => (
            <div
              key={customer._id || index}
              className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2fr_2fr_1fr_1fr] items-start gap-2 py-3 px-4 border text-sm hover:bg-gray-50 transition-colors"
            >
              {/* Name */}
              <div className="flex flex-col">
                <p className="font-medium text-gray-800">{customer.name || "N/A"}</p>
                {/* Mobile view: Show email, phone, address, and joined date */}
                <div className="md:hidden mt-2 space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Email:</span> {customer.email || "N/A"}</p>
                  <p><span className="font-medium">Phone:</span> {customer.profile?.phone || "Not provided"}</p>
                  <p><span className="font-medium">Address:</span> {formatAddress(customer.profile)}</p>
                  <p><span className="font-medium">Joined:</span> {formatDate(customer.createdAt, customer._id)}</p>
                  <button
                    onClick={() => removeCustomer(customer._id, customer.name)}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium text-xs"
                  >
                    Remove Customer
                  </button>
                </div>
              </div>

              {/* Email - Desktop only */}
              <p className="hidden md:block text-gray-700">{customer.email || "N/A"}</p>

              {/* Phone */}
              <p className="hidden md:block text-gray-700">
                {customer.profile?.phone || "Not provided"}
              </p>

              {/* Address */}
              <div className="hidden md:block text-gray-700">
                <p className="text-xs leading-relaxed">{formatAddress(customer.profile)}</p>
              </div>

              {/* Joined Date */}
              <p className="hidden md:block text-gray-700 text-xs">
                {formatDate(customer.createdAt, customer._id)}
              </p>

              {/* Action - Remove Button */}
              <div className="hidden md:flex justify-center">
                <button
                  onClick={() => removeCustomer(customer._id, customer.name)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                  title="Remove customer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Customers;

