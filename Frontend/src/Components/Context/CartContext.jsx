  // CartContext.js
  import React, { createContext, useContext, useState } from 'react';

  const CartContext = createContext();

  export const useCart = () => useContext(CartContext);

  export const CartProvider = ({ children }) => {
    const [cartData, setCartData] = useState([]);

    const UpdateCart = (newCartData) => {
      setCartData((prevCartData) => Array.isArray(newCartData) ? newCartData : [...prevCartData, newCartData]);
    };
    

    return (
      <CartContext.Provider value={{ cartData, UpdateCart ,setCartData }}>
        {children}
      </CartContext.Provider>
    );
  };
