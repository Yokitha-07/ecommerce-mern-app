// import { Link, NavLink } from "react-router-dom";

// const Navbar = () => {
//   const user = JSON.parse(localStorage.getItem("user") || "null");
//   const token = localStorage.getItem("token");

//   const isLoggedIn = !!token;

//   return (
//     <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
//       <h1 className="text-xl font-bold">
//         <Link to="/">Spacexp Shopping</Link>
//       </h1>

//       <ul className="flex space-x-4 items-center">
//         <li><NavLink to="/">Home</NavLink></li>
//         <li><NavLink to="/products">Products</NavLink></li>

//         {/* <li><NavLink to="/checkout">Checkout</NavLink></li> */}

//         <li><NavLink to="/about">About Us</NavLink></li>
//         <li><NavLink to="/contact">Contact</NavLink></li>
//         <li><NavLink to="/wishlist">Wishlist</NavLink></li>
//         <li><NavLink to="/cart">Cart</NavLink></li>
//         {!isLoggedIn ? (
//           <li><NavLink to="/login">Login</NavLink></li>
//         ) : (
//           <li>
//             <button
//               onClick={() => {
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("user");
//                 window.location.href = "/";
//               }}
//               className="hover:text-gray-300"
//             >
//               Logout
//             </button>
//           </li>
//         )}
//         {user?.role === "admin" && (
//           <li><NavLink to="/admin">Dashboard</NavLink></li>
//         )}
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;

import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isLoggedIn = !!token;
  const isAdmin = isLoggedIn && user?.role === "admin";
  const isCustomer = isLoggedIn && user?.role !== "admin"; // or user?.role === "customer"

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // better than window.location
  };

  const linkClass = ({ isActive }) =>
    isActive ? "text-yellow-300 font-semibold" : "hover:text-gray-300";

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to="/">Spacexp Shopping</Link>
      </h1>

      <ul className="flex space-x-4 items-center">
        {/* Public links (visible to everyone) */}
        <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
        <li><NavLink to="/products" className={linkClass}>Products</NavLink></li>
        <li><NavLink to="/about" className={linkClass}>About Us</NavLink></li>
        <li><NavLink to="/contact" className={linkClass}>Contact</NavLink></li>

        {/* Customer-only links */}
        {(isCustomer || isAdmin) && (
          <>
            <li><NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink></li>
            <li><NavLink to="/cart" className={linkClass}>Cart</NavLink></li>
          </>
        )}

        {/* Admin-only link */}
        {isAdmin && (
          <li><NavLink to="/admin" className={linkClass}>Dashboard</NavLink></li>
        )}

        {/* Auth buttons */}
        {!isLoggedIn ? (
          <>
            <li><NavLink to="/login" className={linkClass}>Login</NavLink></li>
          </>
        ) : (
          <li>
            <button onClick={handleLogout} className="hover:text-gray-300">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;