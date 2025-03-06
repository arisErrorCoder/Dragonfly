import React from 'react';
import { useNavigate } from 'react-router-dom';

const Products = ({ products }) => {
  const navigate = useNavigate();

  const handleViewDetail = (product) => {
    navigate('/suprise-planner-inner', { state: { product } });
  };

  return (
    <div className="products-container">
      {products.map((product, index) => (
        <div key={index} className="product-card">
          <img src={product.images} alt={product.name} className="product-image" />
          <h3>{product.name}</h3>
          <p>
            <span className="product-price">₹{product.price}</span>
            {/* <span className="product-old-price">₹{product.oldPrice}</span> */}
          </p>
          <button className="view-detail-button" onClick={() => handleViewDetail(product)}>
            + View Detail
          </button>
        </div>
      ))}
    </div>
  );
};

export default Products;
