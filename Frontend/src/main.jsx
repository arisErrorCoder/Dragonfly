import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './Components/Context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
   <CartProvider>
     <App />
   </CartProvider>
)
