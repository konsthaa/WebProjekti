import {useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import Header from './components/Header';
import LunchMenu from './components/LunchMenu';
import MenuPage from './views/MenuPage';

function App() {
  const [cart, setCart] = useState([]);

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

  return (
    <div className="mx-auto max-w-[650px] p-8 font-sans">
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <MenuPage
              cart={cart}
              setCart={setCart}
              addToCart={addToCart}
            />
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
      </Routes>
    </div>
  );
}

export default App;
