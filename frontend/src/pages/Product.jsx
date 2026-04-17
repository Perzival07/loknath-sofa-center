import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "./../components/RelatedProducts";
import { formatDimensions } from "../utils/dimensionsConverter";

const Product = () => {
  const { productId } = useParams();
  const {
    products,
    currency,
    addToCart,
    fetchProductById,
    token,
    toggleWishlist,
    isWishlisted,
    backendUrl,
    navigate,
  } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    setProductData(null);
    setImage("");
    setLoading(true);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;

    const applyProduct = (item) => {
      setProductData(item);
      setImage(item.image[0]);
    };

    const load = async () => {
      const found = products.find(
        (item) => String(item._id) === String(productId)
      );
      if (found) {
        if (!cancelled) {
          applyProduct(found);
          setLoading(false);
        }
        return;
      }
      const p = await fetchProductById(productId);
      if (cancelled) return;
      if (p) {
        applyProduct(p);
      } else {
        setProductData(null);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, products, fetchProductById]);

  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      if (!productId) return;
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/review/product/${productId}`
        );
        if (cancelled) return;
        if (data.success) {
          setReviews(data.reviews || []);
          setAvgRating(data.avgRating ?? 0);
          setReviewTotal(data.total ?? 0);
        }
      } catch (e) {
        console.log(e);
      }
    };
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [productId, backendUrl]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to leave a review");
      navigate("/login");
      return;
    }
    const text = reviewComment.trim();
    if (text.length < 3) {
      toast.error("Please write a short comment (at least 3 characters)");
      return;
    }
    setReviewSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/review/add`,
        {
          productId,
          rating: reviewRating,
          comment: text,
        },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setReviewComment("");
        const r = await axios.get(
          `${backendUrl}/api/review/product/${productId}`
        );
        if (r.data.success) {
          setReviews(r.data.reviews || []);
          setAvgRating(r.data.avgRating ?? 0);
          setReviewTotal(r.data.total ?? 0);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] border-t-2 pt-10">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
          aria-label="Loading product"
        />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="border-t-2 pt-10 text-center py-20 min-h-[50vh]">
        <p className="text-gray-500 text-lg">Product not found</p>
      </div>
    );
  }

  const dimKey = productData.dimensions
    ? `${productData.dimensions.length}x${productData.dimensions.breadth}x${productData.dimensions.height}`
    : "";

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                loading="lazy"
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt="product_image"
              />
            ))}
          </div>

          <div className="w-4 sm:w-[80%]">
            <img
              loading="lazy"
              src={image}
              className="w-full h-auto"
              alt="product_img"
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl">{productData.name}</h1>

          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-2 text-sm">
            {(productData.stock ?? 0) > 0 ? (
              <span className="text-green-600">
                In stock ({productData.stock} available)
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          {productData.dimensions && (() => {
            const formatted = formatDimensions(productData.dimensions);
            return (
              <div className="flex flex-col gap-4 my-8">
                <p className="text-lg font-medium">Dimensions</p>

                <div className="flex flex-col gap-2 text-gray-700">
                  <div className="border-l-2 border-primary-500 pl-3">
                    <p className="text-xs text-gray-500 mb-1">Metric System</p>
                    <p>
                      Length:{" "}
                      <span className="font-semibold">
                        {formatted.length.displayCm}
                      </span>{" "}
                      ({formatted.length.displayMeters})
                    </p>
                    <p>
                      Breadth:{" "}
                      <span className="font-semibold">
                        {formatted.breadth.displayCm}
                      </span>{" "}
                      ({formatted.breadth.displayMeters})
                    </p>
                    <p>
                      Height:{" "}
                      <span className="font-semibold">
                        {formatted.height.displayCm}
                      </span>{" "}
                      ({formatted.height.displayMeters})
                    </p>
                  </div>

                  <div className="border-l-2 border-primary-500 pl-3 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Imperial System</p>
                    <p>
                      Length:{" "}
                      <span className="font-semibold">
                        {formatted.length.displayFeetInches}
                      </span>
                    </p>
                    <p>
                      Breadth:{" "}
                      <span className="font-semibold">
                        {formatted.breadth.displayFeetInches}
                      </span>
                    </p>
                    <p>
                      Height:{" "}
                      <span className="font-semibold">
                        {formatted.height.displayFeetInches}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {formatted.length.displayCm} × {formatted.breadth.displayCm} ×{" "}
                  {formatted.height.displayCm}
                  <span className="ml-2">
                    ({formatted.length.displayFeetInches} ×{" "}
                    {formatted.breadth.displayFeetInches} ×{" "}
                    {formatted.height.displayFeetInches})
                  </span>
                </p>
              </div>
            );
          })()}

          <div className="flex flex-wrap gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                if (productData.dimensions && (productData.stock ?? 0) > 0) {
                  addToCart(productData._id, dimKey);
                }
              }}
              disabled={(productData.stock ?? 0) <= 0}
              className={`text-white px-8 py-3 text-sm transition-colors ${
                (productData.stock ?? 0) <= 0
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700"
              }`}
            >
              {(productData.stock ?? 0) <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
            {productData.dimensions ? (
              <button
                type="button"
                onClick={() => toggleWishlist(productData._id, dimKey)}
                className={`px-8 py-3 text-sm border transition-colors ${
                  isWishlisted(productData._id, dimKey)
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-gray-800 text-gray-800 hover:bg-gray-50"
                }`}
              >
                {!token
                  ? "SAVE (LOGIN)"
                  : isWishlisted(productData._id, dimKey)
                  ? "SAVED"
                  : "ADD TO WISHLIST"}
              </button>
            ) : null}
          </div>

          <hr className="mt-8 sm:w-4/5" />

          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t pt-10 max-w-3xl">
        <h2 className="text-xl font-medium text-gray-800 mb-2">Reviews</h2>
        <p className="text-sm text-gray-600 mb-6">
          {reviewTotal === 0
            ? "No reviews yet. Be the first to rate this product."
            : `${reviewTotal} review(s) · Average ${avgRating} / 5`}
        </p>

        <form
          onSubmit={submitReview}
          className="mb-10 flex flex-col gap-3 border border-gray-200 p-4 rounded-sm bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-800">Write a review</p>
          <label className="text-sm text-gray-700">
            Rating
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              className="ml-2 border border-gray-300 px-2 py-1 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
            placeholder="Share your experience with this product"
          />
          <button
            type="submit"
            disabled={reviewSubmitting}
            className="self-start bg-primary-500 text-white text-sm px-4 py-2 hover:bg-primary-600 disabled:opacity-50"
          >
            {reviewSubmitting ? "Submitting…" : "Submit review"}
          </button>
        </form>

        <ul className="flex flex-col gap-6">
          {reviews.map((r) => (
            <li
              key={r._id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-800">{r.userName}</span>
                <span className="text-amber-600">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                {r.comment}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString()
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
