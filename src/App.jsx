import {useEffect, useState} from 'react';
import SignInMenu from './components/SignInMenu';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Request failed (${response.status})`);
        }

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
    <div style={{padding: '2rem', fontFamily: 'sans-serif', maxWidth: '650px'}}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{margin: 0}}>Menu</h1>
        <SignInMenu />
      </header>
      {loading ? (
        <p>Loading menu...</p>
      ) : errorMsg ? (
        <p style={{color: 'red'}}>Error: {errorMsg}</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
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

                    <p style={{margin: '0.5rem 0', color: '#CC5500'}}>
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
                    </div>
                  </div>

                  {(product['image_url'] || product['image url']) && (
                    <img
                      src={product['image_url'] || product['image url']}
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
        ))
      )}
    </div>
  );
}

export default App;

//Konstan versio..
