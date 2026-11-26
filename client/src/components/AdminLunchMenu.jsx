import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {fetchData} from '../utils/fetchData';

const emptyItem = {
  name: '',
  price: '',
  category: '',
  date: '',
  Veg: false,
  Glut: false,
  Lacto: false,
};

const fieldClassName =
  'mt-1 block w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-700';
const labelClassName = 'block text-sm font-medium text-stone-800';
const buttonClassName =
  'rounded-md border border-stone-400 bg-white px-3 py-2 font-medium text-stone-900 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60';

function AdminLunchMenu({items, onChanged}) {
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [role, setRole] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyItem);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({data, error: sessionError}) => {
      if (!mounted) return;
      if (sessionError) setAccessError(sessionError.message);
      setSession(data.session);
      setSessionLoaded(true);
    });

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    if (!session?.user) {
      setRole(null);
      return;
    }

    let mounted = true;
    setRole(null);
    setAccessError('');

    async function loadRole() {
      const {data, error: profileError} = await supabase
        .from('USERS')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setAccessError(`Could not verify admin access: ${profileError.message}`);
      } else {
        setRole(data?.role ?? null);
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [session, sessionLoaded]);

  function selectItem(id) {
    const item = items.find((entry) => String(entry.product_id) === id);
    setSelectedId(id);
    setForm(item ? {...item, price: String(item.price)} : emptyItem);
    setError('');
    setMessage('');
  }

  function updateField(event) {
    const {name, value, checked, type} = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function submitItem(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const {
        data: {session: currentSession},
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!currentSession) throw new Error('Sign in with an Admin account first.');

      const isEditing = mode === 'edit';
      const url = isEditing
        ? `/api/v1/lunch-menu/${encodeURIComponent(selectedId)}`
        : '/api/v1/lunch-menu';
      const payload = {...form, price: Number(form.price)};
      if (isEditing) delete payload.product_id;

      await fetchData(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setMessage(isEditing ? 'Lunch menu item updated.' : 'Lunch menu item added.');
      if (!isEditing) setForm(emptyItem);
      onChanged();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not save lunch menu item.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const {
        data: {session: currentSession},
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!currentSession) throw new Error('Sign in with an Admin account first.');

      await fetchData(
        `/api/v1/lunch-menu/${encodeURIComponent(selectedId)}`,
        {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${currentSession.access_token}`},
        },
      );

      setSelectedId('');
      setForm(emptyItem);
      setMessage('Lunch menu item deleted.');
      onChanged();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not delete lunch menu item.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (role !== 'admin') {
    return accessError ? (
      <p className="text-sm text-red-700" role="alert">
        {accessError}
      </p>
    ) : null;
  }

  const selectedItem = items.find(
    (item) => String(item.product_id) === selectedId,
  );

  return (
    <>
      <button
        className={buttonClassName}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Manage lunch menu
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 text-gray-900 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lunch-menu-admin-title"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="lunch-menu-admin-title" className="m-0 text-xl font-bold">
                Manage lunch menu
              </h2>
              <button
                className={buttonClassName}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            <label className={labelClassName}>
              Action
              <select
                className={fieldClassName}
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value);
                  setError('');
                  setMessage('');
                }}
              >
                <option value="add">Add item</option>
                <option value="edit">Update or delete item</option>
              </select>
            </label>

            {mode === 'edit' && (
              <label className={`${labelClassName} mt-4`}>
                Item to manage
                <select
                  className={fieldClassName}
                  value={selectedId}
                  onChange={(event) => selectItem(event.target.value)}
                  required
                >
                  <option value="">Select an item</option>
                  {items.map((item) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.date} — {item.name} (#{item.product_id})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {(mode === 'add' || selectedItem) && (
              <form className="mt-4 space-y-3" onSubmit={submitItem}>
                {[
                  ['name', 'Name', 'text'],
                  ['price', 'Price', 'number'],
                  ['category', 'Category', 'text'],
                  ['date', 'Date', 'date'],
                ].map(([name, label, type]) => (
                  <label
                    key={name}
                    className={labelClassName}
                  >
                    {label}
                    <input
                      className={fieldClassName}
                      name={name}
                      type={type}
                      value={form[name] ?? ''}
                      onChange={updateField}
                      required
                      min={type === 'number' ? '0' : undefined}
                      step={type === 'number' ? '0.01' : undefined}
                    />
                  </label>
                ))}
                {[
                  ['Veg', 'Vegetarian'],
                  ['Glut', 'Gluten-free'],
                  ['Lacto', 'Lactose-free'],
                ].map(([name, label]) => (
                  <label
                    key={name}
                    className="mr-4 inline-flex items-center gap-2 text-sm text-stone-800"
                  >
                    <input
                      className="size-4 rounded border-stone-400 text-red-700 focus:ring-red-700"
                      name={name}
                      type="checkbox"
                      checked={Boolean(form[name])}
                      onChange={updateField}
                    />
                    {label}
                  </label>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button
                    className={buttonClassName}
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving…'
                      : mode === 'edit'
                        ? 'Update item'
                        : 'Add item'}
                  </button>
                  {mode === 'edit' && (
                    <button
                      className="rounded-md border border-red-700 bg-red-700 px-3 py-2 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={deleteItem}
                      disabled={saving || !selectedItem}
                    >
                      Delete item
                    </button>
                  )}
                </div>
              </form>
            )}

            {message && <p className="mt-4 text-sm text-green-800" role="status">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </>
  );
}

export default AdminLunchMenu;
