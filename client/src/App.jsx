import {useState} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';
import Header from './components/Header';
import LunchMenu from './components/LunchMenu';
import MenuPage from './views/MenuPage';
import CartView from './views/CartView';

function App() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.product_id === product.product_id,
      );

      if (existing) {
        return currentCart.map((item) =>
          item.product.product_id === product.product_id
            ? {...item, quantity: item.quantity + 1}
            : item,
        );
      }

      return [...currentCart, {product, quantity: 1}];
    });
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.product_id === productId
          ? {...item, quantity: newQuantity}
          : item,
      ),
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.product_id !== productId),
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-[650px] p-8 font-sans">
      <Header cartCount={cartCount} onOpenCart={() => navigate('/cart')} />

      <Routes>
        <Route
          path="/"
          element={
            <MenuPage cart={cart} setCart={setCart} addToCart={addToCart} />
          }
        />
        <Route
          path="/lunch-menu"
          element={<LunchMenu />}
        />
        <Route
          path="/lunch-menu/"
          element={<LunchMenu />}
        />
        <Route
          path="/cart"
          element={
            <CartView
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
