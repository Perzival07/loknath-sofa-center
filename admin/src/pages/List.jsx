import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({token}) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const pageSize = 100;
      const first = await axios.get(
        `${backendUrl}/api/product/list?page=1&limit=${pageSize}`
      );
      if (!first.data.success) {
        toast.error(first.data.message);
        return;
      }
      let all = [...(first.data.products || [])];
      const totalPages = first.data.pagination?.totalPages || 1;
      for (let page = 2; page <= totalPages; page++) {
        const r = await axios.get(
          `${backendUrl}/api/product/list?page=${page}&limit=${pageSize}`
        );
        if (r.data.success && r.data.products?.length) {
          all = all.concat(r.data.products);
        }
      }
      setList(all);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  


  // Function to remove a product
  // This function will be called when the user clicks on the delete icon

  const removeProduct = async (id) => {
    // Show confirmation dialog before removing
    const product = list.find(item => item._id === id);
    const productName = product ? product.name : 'this product';
    const confirmed = window.confirm(`Are you sure you want to remove "${productName}" from the list? This action cannot be undone.`);
    
    if (!confirmed) {
      return; // User cancelled the deletion
    }

    try {
      const response = await axios.post(backendUrl + '/api/product/remove' , { id }, {headers:{token}});
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(); // Refresh the list after deletion
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleBestseller = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setList((prevList) =>
      prevList.map((product) =>
        product._id === id ? { ...product, bestseller: newStatus } : product
      )
    );

    try {
      const response = await axios.post(
        backendUrl + "/api/product/update-bestseller",
        { id, bestseller: newStatus },
        { headers: { token } }
      );
      if (!response.data.success) {
        setList((prevList) =>
          prevList.map((product) =>
            product._id === id ? { ...product, bestseller: currentStatus } : product
          )
        );
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
      }
    } catch (error) {
      setList((prevList) =>
        prevList.map((product) =>
          product._id === id ? { ...product, bestseller: currentStatus } : product
        )
      );
      console.log(error);
      toast.error(error.message);
    }
  };




  // Fetch the product list when the component mounts
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>

      <div className="flex flex-col gap-2">
        {/* ------ List Table Title--------- */}

        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Bestseller</b>
          <b className="text-center">Action</b>
        </div>

        {/* ------ Product List--------- */}

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="product_image" />
            <div className="flex flex-col gap-1">
              <p>{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600 md:hidden">
                <span>{item.category}</span>
                <span>•</span>
                <span>{currency}{item.price}</span>
                <span>•</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.bestseller || false}
                    onChange={() => toggleBestseller(item._id, item.bestseller || false)}
                    className="w-3 h-3 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  />
                  <span>Bestseller</span>
                </label>
              </div>
            </div>
            <p className="hidden md:block">{item.category}</p>
            <p className="hidden md:block">
              {currency}
              {item.price}
            </p>
            <div className="hidden md:flex justify-center items-center">
              <input
                type="checkbox"
                checked={item.bestseller || false}
                onChange={() => toggleBestseller(item._id, item.bestseller || false)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                title="Mark as bestseller"
              />
            </div>
            <p onClick={() => removeProduct(item._id)} className="text-right md:text-center cursor-pointer text-lg">
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
