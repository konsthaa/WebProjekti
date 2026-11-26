import {useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {fetchData} from '../utils/fetchData';

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (items, token) => {
    setLoading(true);
    setError(null);

    try {
      let authToken = token;

      if (!authToken) {
        const {
          data: {session},
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        authToken = session?.access_token;
      }

      if (!authToken) {
        throw new Error('Kirjaudu sisään tehdäksesi tilauksen.');
      }

      const data = await fetchData('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({items}),
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {createOrder, loading, error};
}
