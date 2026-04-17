import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProducItem from "../components/ProducItem";
import { assets } from "../assets/assets";

const Wishlist = () => {
  const {
    wishlist,
    token,
    addToCart,
    removeFromWishlist,
  } = useContext(ShopContext);

  if (!token) {
    return (
      <div className="border-t pt-16 text-center py-20">
        <p className="text-gray-600 mb-4">
          Log in to view and manage your wishlist.
        </p>
        <Link
          to="/login"
          className="inline-block bg-primary-500 text-white px-6 py-2 rounded-sm hover:bg-primary-600 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="border-t pt-16 text-center py-20">
        <div className="text-2xl mb-6">
          <Title text1={"MY"} text2={"WISHLIST"} />
        </div>
        <p className="text-gray-500">Your wishlist is empty.</p>
        <Link
          to="/collection"
          className="inline-block mt-6 bg-primary-500 text-white px-6 py-2 rounded-sm hover:bg-primary-600 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
        {wishlist.map((item, index) => (
          <div
            key={`${String(item.productId)}-${item.dimensions}-${index}`}
            className="relative"
          >
            {item.product ? (
              <>
                <ProducItem
                  id={String(item.product._id)}
                  name={item.product.name}
                  image={item.product.image}
                  price={item.product.price}
                  dimensions={item.dimensions}
                  showWishlistToggle={false}
                />
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    type="button"
                    title="Add to cart"
                    onClick={() =>
                      addToCart(item.product._id, item.dimensions)
                    }
                    className="bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-primary-500 hover:border-primary-500 transition-colors"
                  >
                    <img
                      src={assets.cart_icon}
                      alt=""
                      className="w-4 h-4"
                    />
                  </button>
                  <button
                    type="button"
                    title="Remove from wishlist"
                    onClick={() =>
                      removeFromWishlist(item.productId, item.dimensions)
                    }
                    className="bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-red-500 hover:border-red-500 transition-colors group"
                  >
                    <img
                      src={assets.cross_icon}
                      alt=""
                      className="w-4 h-4 group-hover:brightness-0 group-hover:invert"
                    />
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-gray-200 rounded-sm p-4 text-sm text-gray-600 flex flex-col gap-3 min-h-[200px]">
                <p>This product is no longer available.</p>
                <button
                  type="button"
                  onClick={() =>
                    removeFromWishlist(item.productId, item.dimensions)
                  }
                  className="text-red-600 border border-red-500 px-3 py-1.5 rounded-sm text-xs hover:bg-red-500 hover:text-white transition-colors w-fit"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
