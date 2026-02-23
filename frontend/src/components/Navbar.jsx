import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">
                <Link to="/">Spacexp Shopping</Link>
            </h1>
            <ul className="flex space-x-4">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/wishlist" className="hover:text-pink-400">Wishlist</Link>
        </li>
                <li><Link to="/cart">Cart </Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;