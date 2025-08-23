import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
        <div className="absolute top-4 right-4">
          <span className="bg-[#D2B48C] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.priceRange}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-sm text-gray-500 font-medium">{product.series}</h3>
          <h2 className="text-xl font-song font-bold text-[#D2B48C] mt-1 mb-1 tracking-song leading-song">{product.name}</h2>
          <p className="text-xs text-gray-400 italic">{product.englishName}</p>
        </div>
        
        <p className="text-gray-700 mt-3 mb-4 h-12 leading-relaxed">{product.slogan}</p>
        
        <div className="mb-4">
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
            product.isMultiPet 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {product.petSupport}
          </span>
        </div>
        
        <Link 
          to={`/customize/${product.id}`}
          className="block w-full bg-[#D2B48C] text-white py-3 px-6 rounded-full font-bold hover:bg-opacity-90 transition-transform duration-300 transform group-hover:scale-105 text-center group-hover:shadow-lg"
        >
          选择这款并开始定制
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;