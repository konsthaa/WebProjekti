import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {fetchData} from '../utils/fetchData';

function MenuPage({cart, setCart, addToCart}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);



  async function placeOrder() {
    setOrderError('');
    setOrderMessage('');

    if (cart.length === 0) {
      setOrderError('Add a menu item first.');
      return;
    }

    setPlacingOrder(true);

    try {
      const {
        data: {session},
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error('Sign in before placing an order.');

      const result = await fetchData('/api/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(({product, quantity}) => ({
            product_id: product.product_id,
            quantity,
          })),
        }),
      });

      setCart([]);
      setOrderMessage(`Order #${result.order_id} placed.`);
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : 'Could not place order.',
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const result = await fetchData('/api/v1/products');

        if (!cancelled) setProducts(result);
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(
            error instanceof Error ? error.message : 'Failed to load products',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  return (
    <main>
      <section id="menu">
        {loading ? (
          <p>Loading menu...</p>
        ) : errorMsg ? (
          <p role="alert" style={{color: 'red'}}>
            Error: {errorMsg}
          </p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          Object.entries(groupedProducts).map(
            ([category, categoryProducts]) => (
              <section key={category}>
                <h2>{category}</h2>
                <ul style={{listStyle: 'none', padding: 0}}>
                  {categoryProducts.map((product) => (
                    <li
                      key={product.product_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid #900',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{flex: 1, minWidth: 0}}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h3 style={{margin: 0, fontSize: '1.2rem'}}>
                            #{product.product_id} — {product.name}
                          </h3>
                          <strong style={{fontSize: '1.1rem'}}>
                            {Number(product.price).toFixed(2)} €
                          </strong>
                        </div>

                        <p style={{margin: '0.5rem 0', color: 'black'}}>
                          {product.description}
                        </p>

                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: '#555',
                            marginTop: '0.75rem',
                          }}
                        >
                          <p style={{margin: '0.25rem 0'}}>
                            <strong>Dietary & Allergens:</strong> Vegetarian:{' '}
                            {product.veg ? 'Yes' : 'No'} | Gluten-free:{' '}
                            {product.glut ? 'Yes' : 'No'} | Lactose-free:{' '}
                            {product.lacto ? 'Yes' : 'No'}
                          </p>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>

                      {(product.image_url || product['image url']) && (
                        <img
                          src={product.image_url || product['image url']}
                          alt={product.name}
                          style={{
                            width: '140px',
                            height: '110px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )
        )}
      </section>

      <section id="cart">
        <h2>Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul>
              {cart.map(({product, quantity}) => (
                <li key={product.product_id}>
                  {product.name} × {quantity}
                </li>
              ))}
            </ul>
            <button type="button" onClick={placeOrder} disabled={placingOrder}>
              {placingOrder ? 'Placing order…' : 'Place order'}
            </button>
          </>
        )}

        {orderMessage && <p role="status">{orderMessage}</p>}
        {orderError && <p role="alert">{orderError}</p>}
      </section>
    </main>
  );
}

export default MenuPage;
