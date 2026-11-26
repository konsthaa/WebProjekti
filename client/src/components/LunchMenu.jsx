import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {fetchData} from '../utils/fetchData';

function LunchMenu({addToCart}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLunchMenu() {
      try {
        const result = await fetchData('/api/v1/lunch-menu');

        if (!cancelled) setItems(result.data ?? []);
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(
            error instanceof Error ? error.message : 'Failed to load lunch menu',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLunchMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingItems = items
    .filter((item) => {
      if (!item.date) return false;

      const itemDate = new Date(`${item.date}T00:00:00`);
      return !Number.isNaN(itemDate.getTime()) && itemDate >= today;
    })
    .sort((a, b) => {
      return new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`);
    });

  const groupedItems = upcomingItems.reduce((groups, item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
    return groups;
  }, {});

  return (
    <main>
      <p>
        <Link to="/">Back to home</Link>
      </p>
      <h2>Lunch menu</h2>

      {loading ? (
        <p>Loading lunch menu...</p>
      ) : errorMsg ? (
        <p role="alert" style={{color: 'red'}}>
          Error: {errorMsg}
        </p>
      ) : upcomingItems.length === 0 ? (
        <p>No upcoming lunch menu items found.</p>
      ) : (
        Object.entries(groupedItems).map(([date, dateItems]) => (
          <section key={date}>
            <h3>{date}</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
              {dateItems.map((item) => (
                <li
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: '1px solid #900',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{fontSize: '0.9rem', color: '#555'}}>
                      {item.category || 'Other'}
                    </div>
                    <div style={{fontSize: '0.9rem', color: '#555', marginTop: '0.35rem'}}>
                      <strong>Dietary:</strong>{' '}
                      Vegetarian: {item.Veg ? 'Yes' : 'No'} |{' '}
                      Gluten-free: {item.Glut ? 'Yes' : 'No'} |{' '}
                      Lactose-free: {item.Lacto ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <strong>{Number(item.price).toFixed(2)} €</strong>
                  <button type="button" onClick={() => addToCart(item)}>
                    Lisää ostoskoriin
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}

export default LunchMenu;
