import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const ProducItem = ({
  id,
  image,
  name,
  price,
  dimensions,
  showWishlistToggle = true,
}) => {
  const { currency, token, toggleWishlist, isWishlisted } =
    useContext(ShopContext);

  const inList = dimensions && isWishlisted(id, dimensions);

  const onWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dimensions) return;
    toggleWishlist(id, dimensions);
  };

  return (
    <div className="relative group">
      <Link className="text-gray-700 cursor-pointer block" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            loading="lazy"
            className="hover:scale-110 transition ease-out"
            src={image[0]}
            alt="product_img"
          />
        </div>

        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
      {showWishlistToggle && token && dimensions ? (
        <button
          type="button"
          title={inList ? "Remove from wishlist" : "Add to wishlist"}
          onClick={onWishlistClick}
          className={`absolute top-2 right-2 z-10 rounded-full p-1.5 shadow-md border transition-colors ${
            inList
              ? "bg-primary-500 border-primary-500 text-white"
              : "bg-white border-gray-200 text-gray-700 hover:border-primary-500"
          }`}
          aria-pressed={inList}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill={inList ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
};

ProducItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  image: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  dimensions: PropTypes.string,
  showWishlistToggle: PropTypes.bool,
};

export default ProducItem;
