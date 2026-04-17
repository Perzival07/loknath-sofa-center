import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, fetchProductById } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);



  useEffect(() => {
    const tempData = [];
    const ids = new Set();
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            dimensions: item,
            quantity: cartItems[items][item],
          });
          ids.add(items);
        }
      }
    }
    setCartData(tempData);

    const missing = [...ids].filter(
      (id) => !products.some((p) => String(p._id) === String(id))
    );
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of missing) {
        if (cancelled) return;
        await fetchProductById(id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartItems, products, fetchProductById]);



  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => String(product._id) === String(item._id)
          );

          if (!productData) {
            return (
              <div
                key={`${item._id}-${item.dimensions}`}
                className="py-4 border-t border-b text-gray-500 text-sm"
              >
                Loading product…
              </div>
            );
          }

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={productData.image[0]}
                  alt=""
                />

                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    {(() => {
                      const dims = item.dimensions.split('x');
                      const formatDim = (cm) => {
                        const totalInches = Number(cm) / 2.54;
                        const feet = Math.floor(totalInches / 12);
                        const inches = Math.round((totalInches % 12) * 10) / 10;
                        return { cm: Math.round(Number(cm)), feet, inches, meters: Math.round((Number(cm) / 100) * 100) / 100 };
                      };
                      const length = formatDim(dims[0]);
                      const breadth = formatDim(dims[1]);
                      const height = formatDim(dims[2]);
                      return (
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 text-xs">
                          {length.cm}×{breadth.cm}×{height.cm}cm<br/>
                          <span className="text-[10px]">{length.feet}'{length.inches}"×{breadth.feet}'{breadth.inches}"×{height.feet}'{height.inches}"</span>
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <input
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") return;
                  const n = Number(val);
                  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return;
                  if (n > 99) {
                    toast.warn("Maximum quantity per item is 99");
                    return;
                  }
                  updateQuantity(item._id, item.dimensions, n);
                }}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                max={99}
                value={item.quantity}
              />


              <img
                onClick={() => updateQuantity(item._id, item.dimensions, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="bin_icon"
              />

              
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />

          <div className="w-full text-end">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-primary-500 hover:bg-primary-600 text-white text-sm my-8 px-8 py-3 transition-colors"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
