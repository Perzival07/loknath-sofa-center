import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { ShopContext } from "./../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "./../components/Title";
import ProducItem from "./../components/ProducItem";
import { dimensionsToKey } from "../utils/dimensionsConverter";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Collection = () => {
  const {
    products,
    search,
    showSearch,
    pagination,
    loadMoreProducts,
    loadingMore,
    catalogReady,
    currency,
  } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevent");
  const [priceMax, setPriceMax] = useState(500000);

  const priceSliderMax = useMemo(() => {
    const hi = products.reduce(
      (m, p) => Math.max(m, Number(p.price) || 0),
      0
    );
    return Math.min(
      500000,
      Math.max(50000, Math.ceil(Math.max(hi, 1) / 5000) * 5000)
    );
  }, [products]);

  useEffect(() => {
    setPriceMax((prev) => Math.min(prev, priceSliderMax));
  }, [priceSliderMax]);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilterAndSort = useCallback(() => {
    let list = products.slice();

    if (showSearch && search) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      list = list.filter((item) => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      list = list.filter((item) => subCategory.includes(item.subCategory));
    }

    if (priceMax < priceSliderMax) {
      list = list.filter((item) => Number(item.price) <= priceMax);
    }

    switch (sortType) {
      case "low-high":
        list.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        list.sort((a, b) => b.price - a.price);
        break;
      case "bestseller":
        list.sort(
          (a, b) => (b.bestseller === true) - (a.bestseller === true)
        );
        break;
      default:
        break;
    }

    setFilterProducts(list);
  }, [
    products,
    category,
    subCategory,
    search,
    showSearch,
    sortType,
    priceMax,
    priceSliderMax,
  ]);

  useEffect(() => {
    applyFilterAndSort();
  }, [applyFilterAndSort]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="dropdown_icon"
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>

          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Living Room"}
                onChange={toggleCategory}
              />
              Living Room
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Bedroom"}
                onChange={toggleCategory}
              />
              Bedroom
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Dining Room"}
                onChange={toggleCategory}
              />
              Dining Room
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Office"}
                onChange={toggleCategory}
              />
              Office
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Outdoor"}
                onChange={toggleCategory}
              />
              Outdoor
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Storage"}
                onChange={toggleCategory}
              />
              Storage
            </p>
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>

          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Sofas"}
                onChange={toggleSubCategory}
              />
              Sofas
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Tables"}
                onChange={toggleSubCategory}
              />
              Tables
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Chairs"}
                onChange={toggleSubCategory}
              />
              Chairs
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Beds"}
                onChange={toggleSubCategory}
              />
              Beds
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Wardrobes"}
                onChange={toggleSubCategory}
              />
              Wardrobes
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Desks"}
                onChange={toggleSubCategory}
              />
              Desks
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Shelving"}
                onChange={toggleSubCategory}
              />
              Shelving
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Storage"}
                onChange={toggleSubCategory}
              />
              Storage
            </p>

            <p className="flex gap-2">
              <input
                className="w-4"
                type="checkbox"
                value={"Lighting"}
                onChange={toggleSubCategory}
              />
              Lighting
            </p>
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">PRICE RANGE</p>
          <input
            type="range"
            min={0}
            max={priceSliderMax}
            step={500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full max-w-[200px]"
          />
          <p className="text-sm text-gray-700 mt-2">
            Up to {currency}
            {priceMax.toLocaleString()}
            {priceMax >= priceSliderMax ? " (all)" : ""}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-base sm:text-2xl mb-4">
          <Title text1={"All"} text2={"COLLECTIONS"} />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2 py-1 max-w-full sm:max-w-xs"
          >
            <option value="relevent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
            <option value="bestseller">Sort by: Bestseller</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {!catalogReady
            ? Array.from({ length: 8 }).map((_, i) => (
                <LoadingSkeleton key={i} type="product" />
              ))
            : filterProducts.map((item, index) => (
                <ProducItem
                  key={item._id || index}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.image}
                  dimensions={dimensionsToKey(item.dimensions)}
                />
              ))}
        </div>

        {pagination.currentPage < pagination.totalPages && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More Products"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
