import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const isLoggedIn = !!token;

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to="/">Spacexp Shopping</Link>
      </h1>

      <ul className="flex space-x-4 items-center">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/products">Products</NavLink></li>

        {/* <li><NavLink to="/checkout">Checkout</NavLink></li> */}

        <li><NavLink to="/about">About Us</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
        <li><NavLink to="/wishlist">Wishlist</NavLink></li>
        <li><NavLink to="/cart">Cart</NavLink></li>
        {!isLoggedIn ? (
          <li><NavLink to="/login">Login</NavLink></li>
        ) : (
          <li>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
              className="hover:text-gray-300"
            >
              Logout
            </button>
          </li>
        )}
        {user?.role === "admin" && (
          <li><NavLink to="/admin">Dashboard</NavLink></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;