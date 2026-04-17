import { createContext, useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹ ";
  const delivery_fee = 0;

  // backendUrl is imported from the admin app
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // for searching state
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // for products state
  const [cartItems, setCartItems] = useState({});

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [token, setToken] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [catalogReady, setCatalogReady] = useState(false);

  const navigate = useNavigate();
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const setTokenRef = useRef(setToken);
  useEffect(() => {
    setTokenRef.current = setToken;
  }, [setToken]);

  useEffect(() => {
    const idReq = axios.interceptors.request.use((config) => {
      const fromStore = localStorage.getItem("token");
      if (fromStore) {
        config.headers = { ...config.headers, token: fromStore };
      }
      return config;
    });

    const idRes = axios.interceptors.response.use(
      (r) => r,
      async (error) => {
        const original = error.config;
        const status = error.response?.status;
        if (status !== 401 || !original || original._authRetry) {
          return Promise.reject(error);
        }
        const url = String(original.url || "");
        if (
          /\/(api\/v1\/|api\/)user\/(login|register|refresh-token)/.test(url)
        ) {
          return Promise.reject(error);
        }
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          return Promise.reject(error);
        }
        original._authRetry = true;
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/refresh-token`,
            { refreshToken }
          );
          if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            setTokenRef.current(data.token);
            original.headers = { ...original.headers, token: data.token };
            return axios(original);
          }
        } catch (e) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setTokenRef.current("");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(idReq);
      axios.interceptors.response.eject(idRes);
    };
  }, [backendUrl]);

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const addToCart = async (itemId, dimensions) => {
    if (!dimensions) {
      toast.error("Product dimensions required");
      return;
    }

    let cartData = deepClone(cartItems);
    // check if the item already exists in the cart
    // if it does, increment the quantity
    if (cartData[itemId]) {
      if (cartData[itemId][dimensions]) {
        cartData[itemId][dimensions] += 1;
      } else {
        cartData[itemId][dimensions] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][dimensions] = 1;
    }

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, dimensions },
          { headers: { token } }
        );
        setCartItems(cartData);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message);
      }
    } else {
      setCartItems(cartData);
    }

  };

  // add to card counter
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error("Error calculating cart count:", error);
        }
      }
    }
    return totalCount;
  };




  // update quantity of the cart item
  const updateQuantity = async (itemId, dimensions, quantity) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty)) return;
    if (qty < 0 || qty > 99) return;

    let cartData = deepClone(cartItems);
    if (!cartData[itemId]) return;

    cartData[itemId][dimensions] = qty;

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, dimensions, quantity },
          { headers: { token } }
        );
        setCartItems(cartData);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message);
      }
    } else {
      setCartItems(cartData);
    }
};

  





const getCartAmount = () => {
  let totalAmount = 0;
  for (const itemId in cartItems) {
    const itemInfo = products.find((product) => product._id === itemId);
    if (!itemInfo) continue; // ⚠️ যদি itemInfo না পাওয়া যায়, তাহলে skip
    for (const dimensions in cartItems[itemId]) {
      try {
        const quantity = cartItems[itemId][dimensions];
        if (quantity > 0) {
          totalAmount += itemInfo.price * quantity;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  return totalAmount;
};









  const getProductsData = useCallback(
    async (page = 1, append = false) => {
      try {
        const limit = paginationRef.current.limit || 20;
        const response = await axios.get(
          `${backendUrl}/api/product/list?page=${page}&limit=${limit}`
        );
        if (response.data.success) {
          const newProducts = response.data.products || [];
          if (append) {
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            setProducts(newProducts);
          }
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        if (!append && page === 1) {
          setCatalogReady(true);
        }
      }
    },
    [backendUrl]
  );

  const loadingMoreRef = useRef(false);
  const loadMoreProducts = useCallback(async () => {
    if (loadingMoreRef.current) return;
    const { currentPage, totalPages } = paginationRef.current;
    if (currentPage >= totalPages) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await getProductsData(currentPage + 1, true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [getProductsData]);

  const fetchProductById = useCallback(
    async (productId) => {
      if (!productId) return null;
      try {
        const { data } = await axios.post(`${backendUrl}/api/product/single`, {
          productId,
        });
        if (data.success && data.product) {
          const p = data.product;
          setProducts((prev) =>
            prev.some((x) => String(x._id) === String(p._id)) ? prev : [...prev, p]
          );
          return p;
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    },
    [backendUrl]
  );





  
  // Fetch user cart data from the backend
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/wishlist/get`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        setWishlist(data.wishlist?.items ?? []);
      }
    } catch (error) {
      console.log(error);
    }
  }, [token, backendUrl]);

  const isWishlisted = useCallback(
    (productId, dimensions) =>
      wishlist.some(
        (w) =>
          String(w.productId) === String(productId) &&
          w.dimensions === dimensions
      ),
    [wishlist]
  );

  const addToWishlist = async (productId, dimensions) => {
    if (!token) {
      toast.error("Please log in to save items to your wishlist");
      navigate("/login");
      return;
    }
    if (!dimensions) {
      toast.error("Product dimensions required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId, dimensions },
        { headers: { token } }
      );
      if (data.success) {
        await fetchWishlist();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const removeFromWishlist = async (productId, dimensions) => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId, dimensions },
        { headers: { token } }
      );
      if (data.success) {
        await fetchWishlist();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleWishlist = async (productId, dimensions) => {
    if (!dimensions) return;
    if (isWishlisted(productId, dimensions)) {
      await removeFromWishlist(productId, dimensions);
    } else {
      await addToWishlist(productId, dimensions);
    }
  };

  
  useEffect(() => {
    getProductsData(1, false);
  }, [getProductsData]);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [token, fetchWishlist]);

  const value = {
    products,
    pagination,
    loadingMore,
    loadMoreProducts,
    fetchProductById,
    getProductsData,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    catalogReady,
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
  };

  
  ShopContextProvider.propTypes = {
    children: PropTypes.node.isRequired, // Validates that 'children' is a React node and required
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
