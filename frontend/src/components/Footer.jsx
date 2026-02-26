// const Footer = () => {
//   return (
//     <footer style={{ padding: "16px", textAlign: "center" }}>
//       <p>© {new Date().getFullYear()} My Shop</p>
//     </footer>
//   );
// };

// export default Footer;

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center p-4 mt-10">
      © {new Date().getFullYear()} Spacexp Shopping. All rights reserved.
    </footer>
  );
};

export default Footer;