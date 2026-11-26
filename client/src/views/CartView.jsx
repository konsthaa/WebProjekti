import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCreateOrder} from '../hooks/apiHooks';

const CartView = ({
  cart = [],
  updateQuantity,
  removeFromCart,
  clearCart,
  token,
}) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const {createOrder, loading} = useCreateOrder();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    setStatusMessage('');
    setIsError(false);

    try {
      const items = cart.map((item) => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
      }));

      const data = await createOrder(items, token);
      const orderId =
        data?.order_id ?? data?.id ?? data?.order?.order_id ?? data?.order?.id;

      clearCart();
      setStatusMessage(orderId ? `Order #${orderId} placed` : 'Order placed');
    } catch (error) {
      setIsError(true);
      setStatusMessage(error.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold">Ostoskori</h1>
        {statusMessage && (
          <p
            className={`mb-4 font-medium ${
              isError ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {statusMessage}
          </p>
        )}
        <p className="mb-6 text-gray-600">Ostoskorisi on tyhjä.</p>
        <Link to="/" className="btn-primary">
          Siirry ruokalistaan
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ostoskori</h1>
        <Link to="/" className="text-sm underline">
          ← Jatka valintaa
        </Link>
      </div>

      <ul className="divide-y divide-gray-200 border-y border-gray-200">
        {cart.map((item) => (
          <li
            key={item.product.product_id}
            className="flex items-center justify-between py-4"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                {Number(item.product.price).toFixed(2)} € / kpl
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.product.product_id, item.quantity - 1)
                }
                className="rounded border px-2 py-1"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.product.product_id, item.quantity + 1)
                }
                className="rounded border px-2 py-1"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeFromCart(item.product.product_id)}
                className="ml-2 text-sm text-red-600 hover:underline"
              >
                Poista
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-lg font-bold">
        <span>Yhteensä</span>
        <span>{totalPrice.toFixed(2)} €</span>
      </div>

      {statusMessage && (
        <p
          className={`mt-4 text-sm ${
            isError ? 'text-red-600' : 'text-green-700'
          }`}
        >
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary mt-6 w-full"
      >
        {loading ? 'Lähetetään tilausta...' : 'Place order'}
      </button>
    </div>
  );
};

export default CartView;
