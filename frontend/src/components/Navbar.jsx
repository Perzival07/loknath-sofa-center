import { assets } from "./../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";


const adminPanelUrl =
  import.meta.env.VITE_ADMIN_URL || "https://forever-admin-omega-liard.vercel.app/";

function Navbar() {
  const [visible, setVisible] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    wishlist,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken("");
    // toast.success("Logout successful");
    setCartItems({});
    
    


  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to={"/"}>
        <img src={assets.logo} className="w-36" alt="logoImage" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>


        <NavLink
          target="_blank"
          rel="noopener noreferrer"
          to={adminPanelUrl}
          className="flex flex-col items-center gap-1 "
        >
          <span className="border px-5 text-sm py-1 rounded-full -mt-1">Admin Panel</span>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>

      </ul>

      <div className="flex items-center gap-6">
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="searchIcon"
        />

        <div className="group relative">
          <img
            onClick={() => token ? null : navigate("/login")}
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="pofileIcon"
          />

          {/* dropdown menu for profile icon */}
          {token && 
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p onClick={() => navigate("/profile")} className="cursor-pointer hover:text-black">My Profile</p>
                <p onClick={() => navigate("/orders")} className="cursor-pointer hover:text-black">Orders</p>
                <p onClick={() => navigate("/wishlist")} className="cursor-pointer hover:text-black">Wishlist</p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          }

        </div>



        <Link to="/wishlist" className="relative" aria-label="Wishlist">
          <img
            src={assets.wishlist_icon}
            className="w-5 min-w-5"
            alt=""
          />
          {wishlist.length > 0 ? (
            <span className="absolute right-[-6px] bottom-[-6px] min-w-[16px] h-4 px-0.5 text-center leading-4 bg-primary-500 text-white rounded-full text-[9px] font-medium">
              {wishlist.length > 99 ? "99+" : wishlist.length}
            </span>
          ) : null}
        </Link>

        {/* card icon start */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="cartIco" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-primary-500 text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        {/* card icon end */}

        {/* mobile responsive menu icon */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          alt="menu_icon"
          className="w-5 cursor-pointer sm:hidden"
        />
      </div>

      {/* sidebar menu for small screen basically for mobile */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="close_icon"
            />
            <p>Back</p>
          </div>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            Collection
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            About
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            Contact
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/wishlist"
          >
            Wishlist
          </NavLink>
            <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            target="_blank"
            rel="noopener noreferrer"
            to={adminPanelUrl}
          >
            Admin Panel
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
