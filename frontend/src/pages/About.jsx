// export default function About() {
//   return (
//     <div>
//       <h1>About Page</h1>
//     </div>
//   );
// }

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">🚀 About SpaceXP Shopping Store</h1>
        <p className="text-gray-600 text-lg">
          Where innovation meets everyday lifestyle.
        </p>
      </div>

      {/* Main Description */}
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to <span className="font-semibold">SpaceXP Shopping Store</span> — 
          your trusted destination for quality products at competitive prices. 
          We believe shopping should be exciting, convenient, and reliable.
        </p>

        <p>
          We carefully select our products to meet modern standards of quality, 
          style, and functionality. Whether you're searching for the latest trends, 
          everyday essentials, or something unique, SpaceXP is here to serve you.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">🌟 Our Mission</h2>
        <p className="text-gray-700">
          To make online shopping simple, secure, and accessible for everyone.
        </p>
      </div>

      {/* Why Choose Us */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">💫 Why Choose SpaceXP?</h2>

        <ul className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <li className="bg-gray-100 p-4 rounded-lg shadow-sm">
            ✅ Quality products you can trust
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-sm">
            🚚 Fast and reliable delivery
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-sm">
            🔒 Secure payment methods
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-sm">
            💬 Dedicated customer support
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-sm sm:col-span-2">
            🎁 Regular deals and special offers
          </li>
        </ul>
      </div>

      {/* Vision Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">🚀 Our Vision</h2>
        <p className="text-gray-700">
          To become a trusted and innovative online shopping destination that 
          delivers value and satisfaction to customers across the region.
        </p>
      </div>

      {/* Promise Section */}
      <div className="mt-12 bg-black text-white p-8 rounded-xl text-center">
        <h2 className="text-2xl font-semibold mb-4">💙 Our Promise</h2>
        <p>
          Customer satisfaction is our top priority. We are committed to 
          providing excellent service, secure transactions, and a shopping 
          experience you’ll love coming back to.
        </p>
      </div>

    </div>
  );
}