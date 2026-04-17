import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import CartTotal from "./../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [showUpiQr, setShowUpiQr] = useState(false);
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    distance: "", // Distance from store in km
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    floor: 0,
    hasElevator: true,
    needDismantling: false,
    needPacking: false,
  });

  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [deliveryRange, setDeliveryRange] = useState({ min: 0, max: 0 });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onDeliveryOptionChange = (name, value) => {
    setDeliveryOptions((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch user profile on component mount to pre-fill form
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/profile`,
        {},
        { headers: { token } }
      );

      if (response.data.success && response.data.user?.profile) {
        const userProfile = response.data.user.profile;
        setFormData(prev => ({
          firstName: userProfile.firstName || prev.firstName,
          lastName: userProfile.lastName || prev.lastName,
          email: userProfile.email || prev.email || response.data.user.email || prev.email,
          street: userProfile.address?.street || prev.street,
          city: userProfile.address?.city || prev.city,
          state: userProfile.address?.state || prev.state,
          zipcode: userProfile.address?.zipcode || prev.zipcode,
          country: userProfile.address?.country || prev.country,
          phone: userProfile.phone || prev.phone,
          distance: userProfile.defaultDistance?.toString() || prev.distance,
        }));
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      // Silently fail - user can still fill the form manually
    }
  };

  useEffect(() => {
    let cancelled = false;
    const dist = Number(formData.distance);
    const run = async () => {
      if (!formData.distance || !Number.isFinite(dist) || dist <= 0) {
        setCalculatedDeliveryFee(0);
        setDeliveryRange({ min: 0, max: 0 });
        return;
      }
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/delivery/calculate`,
          { distance: dist, options: deliveryOptions }
        );
        if (cancelled) return;
        if (data.success) {
          setCalculatedDeliveryFee(Number(data.fee) || 0);
          setDeliveryRange(
            data.range && typeof data.range.min === "number"
              ? data.range
              : { min: 0, max: 0 }
          );
        } else {
          setCalculatedDeliveryFee(0);
          setDeliveryRange({ min: 0, max: 0 });
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          toast.error("Could not calculate delivery fee. Try again.");
          setCalculatedDeliveryFee(0);
          setDeliveryRange({ min: 0, max: 0 });
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [formData.distance, deliveryOptions, backendUrl]);



  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
      amount: order.amount,
      name: 'Order Payment', 
      description: 'Order Payment',
      order_id: order.id, 
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response)
        try {
            const {data} = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, {headers: {token}})
            if(data.success){
              navigate('/orders');
              setCartItems({});
            }
        } catch (error){
          console.log(error);
          toast.error(error)
        }
      }
    }


    const rzp = new window.Razorpay(options);
    rzp.open();
  }




  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.dimensions = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      // Use calculated delivery fee if distance is provided, otherwise use default
      const finalDeliveryFee = calculatedDeliveryFee > 0 ? calculatedDeliveryFee : delivery_fee;

      let orderData = {
        address: { ...formData, deliveryOptions },
        items: orderItems,
        amount: getCartAmount() + finalDeliveryFee,
        deliveryFee: finalDeliveryFee,
      };

      switch (method) {
        case "cod":
          try {
            const response = await axios.post(
              `${backendUrl}/api/order/place`,
              orderData,
              { headers: { token } }
            );
       

            if (response.data.success) {
              setCartItems({});
              navigate("/orders");
              toast.success("Order placed successfully!");
            } else {
              toast.error(response.data.message || "Order failed.");
            }
          } catch (error) {
            console.error("Order API error:", error);
            toast.error(
              error.response?.data?.message || "Something went wrong."
            );
          }
          break;
        
        case "upi":
          try {
            const response = await axios.post(
              `${backendUrl}/api/order/place`,
              { ...orderData, paymentMethod: "UPI" },
              { headers: { token } }
            );

            if (response.data.success) {
              setCartItems({});
              setShowUpiQr(true);
              toast.success(
                "Order created! Complete the UPI payment using the QR code. Our team will confirm payment manually."
              );
              setTimeout(() => navigate("/orders"), 5000);
            } else {
              toast.error(response.data.message || "Order failed.");
            }
          } catch (error) {
            console.error("Order API error:", error);
            toast.error(
              error.response?.data?.message || "Something went wrong."
            );
          }
          break;
          
        // Stripe payment method - DISABLED
        // case "stripe": {
        //   try {
        //     const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {headers: {token}})
        //     if(responseStripe.data.success){
        //       const {session_url} = responseStripe.data
        //       window.location.replace(session_url);
        //     } else {
        //       toast.error(responseStripe.data.message || "Failed to create payment session");
        //     }
        //   } catch (error) {
        //     console.error("Stripe payment error:", error);
        //     toast.error(
        //       error.response?.data?.message || "Failed to process Stripe payment. Please try again."
        //     );
        //   }
        //   break;
        // }

        // Razorpay payment method - DISABLED
        // case "razorpay": {
        //   try {
        //     const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers: {token}})
        //     if(responseRazorpay.data.success){
        //       initPay(responseRazorpay.data.order);
        //     } else {
        //       toast.error(responseRazorpay.data.message || "Failed to create Razorpay order");
        //     }
        //   } catch (error) {
        //     console.error("Razorpay payment error:", error);
        //     toast.error(
        //       error.response?.data?.message || "Failed to process Razorpay payment. Please try again."
        //     );
        //   }
        //   break;
        // }


        default:
          toast.warn("Invalid payment method.");
          break;
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ---------Left Side----------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="flex items-center justify-between my-3">
          <div className="text-xl sm:text-2xl">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-sm text-primary-500 hover:text-primary-600 underline"
          >
            Save to Profile
          </button>
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>

        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email Address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>

        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />

        <input
          required
          onChange={onChangeHandler}
          name="distance"
          value={formData.distance}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          min="0"
          step="0.1"
          placeholder="Distance from store (km)"
        />

        {/* Delivery Options */}
        <div className="border border-gray-300 rounded p-4 mt-2">
          <p className="font-semibold mb-3">Delivery Options</p>
          
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Floor Number</label>
              <input
                onChange={(e) => onDeliveryOptionChange("floor", Number(e.target.value) || 0)}
                value={deliveryOptions.floor}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deliveryOptions.hasElevator}
                  onChange={(e) => onDeliveryOptionChange("hasElevator", e.target.checked)}
                />
                <span className="text-sm">Has Elevator</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryOptions.needDismantling}
                onChange={(e) => onDeliveryOptionChange("needDismantling", e.target.checked)}
              />
              <span className="text-sm">Need Dismantling & Reassembly (₹800-1,200)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryOptions.needPacking}
                onChange={(e) => onDeliveryOptionChange("needPacking", e.target.checked)}
              />
              <span className="text-sm">Need Packing/Protection (₹500-800)</span>
            </label>
          </div>

          {formData.distance && formData.distance > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <p className="text-sm font-semibold">Estimated Delivery Charge:</p>
              <p className="text-lg font-bold text-primary-600">₹{calculatedDeliveryFee}</p>
              <p className="text-xs text-gray-600 mt-1">
                Range: ₹{deliveryRange.min} - ₹{deliveryRange.max}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ----------Rigt Side----------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal deliveryFee={calculatedDeliveryFee > 0 ? calculatedDeliveryFee : undefined} />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* ------Payment Method Selection-------- */}
          <div className="flex gap-3 flex-col lg:flex-row">
            {/* Stripe payment method - DISABLED */}
            {/* <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              ></p>
              <img src={assets.stripe_logo} alt="stripe_logo" />
            </div> */}
            <div
              className="flex items-center gap-3 border p-2 px-3 cursor-not-allowed opacity-50 grayscale"
            >
              <p className="min-w-3.5 h-3.5 border rounded-full"></p>
              <img src={assets.stripe_logo} alt="stripe_logo" />
            </div>

            {/* Razorpay payment method - DISABLED */}
            {/* <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              ></p>
              <img src={assets.razorpay_logo} alt="razorpay_logo" />
            </div> */}
            <div
              className="flex items-center gap-3 border p-2 px-3 cursor-not-allowed opacity-50 grayscale"
            >
              <p className="min-w-3.5 h-3.5 border rounded-full"></p>
              <img src={assets.razorpay_logo} alt="razorpay_logo" />
            </div>

            <div
              onClick={() => {
                setMethod("cod");
                setShowUpiQr(false);
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELEVERY
              </p>
            </div>

            <div
              onClick={() => {
                setMethod("upi");
                setShowUpiQr(false);
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "upi" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                UPI PAYMENT
              </p>
            </div>
          </div>

          {/* UPI QR Code Display */}
          {showUpiQr && method === "upi" && (
            <div className="mt-6 p-6 border rounded-lg bg-gray-50">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Scan QR Code to Pay</h3>
                <div className="border-4 border-white rounded-lg shadow-lg p-4 bg-white">
                  <img 
                    src={assets.upi_qr} 
                    alt="UPI QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR with your UPI app (Google Pay, PhonePe, Paytm, etc.) and pay the order amount.
                  <br />
                  <br />
                  <strong>
                    After you pay, our admin will verify the payment and confirm your order.
                  </strong>
                  <br />
                  You can track the order on the <strong>Orders</strong> page (payment may show as pending until
                  verified).
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2 text-sm rounded transition-colors"
                >
                  Go to My Orders
                </button>
              </div>
            </div>
          )}

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-16 py-3 text-sm transition-colors"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
