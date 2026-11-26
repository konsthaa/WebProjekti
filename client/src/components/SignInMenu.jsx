import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {fetchData} from '../utils/fetchData';

function SignInMenu() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({data, error: sessionError}) => {
      if (!mounted) return;

      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setRole(null);
      return;
    }

    let mounted = true;
    setRole(null);

    async function loadRole() {
      const {data, error: profileError} = await supabase
        .from('USERS')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setError(`Could not load your profile: ${profileError.message}`);
      } else if (!data) {
        setError('No matching USERS profile was found for this account.');
      } else {
        setError('');
        setRole(data.role);
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [session]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const result =
      mode === 'register'
        ? await supabase.auth.signUp({
            email,
            password,
            options: {data: {username, name}},
          })
        : await supabase.auth.signInWithPassword({email, password});

    if (result.error) {
      setError(result.error.message);
    } else if (mode === 'register' && !result.data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
    } else if (mode === 'register') {
      setMessage('Your account was created.');
    }
  }

  async function handlePasswordRecovery() {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Enter your email first.');
      return;
    }

    const {error: resetError} = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {redirectTo: window.location.origin},
    );

    if (resetError) setError(resetError.message);
    else setMessage('Check your email for the password reset link.');
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const {error: updateError} = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setIsPasswordRecovery(false);
      setNewPassword('');
      setMessage('Password updated successfully.');
    }
  }

  async function handleSignOut() {
    setError('');
    const {error: signOutError} = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    } else {
      setOrders(null);
      setShowOrders(false);
    }
  }

  async function loadOrders() {
    if (showOrders) {
      setShowOrders(false);
      return;
    }

    if (orders !== null) {
      setShowOrders(true);
      return;
    }

    setError('');

    const {
      data: {session: currentSession},
    } = await supabase.auth.getSession();

    if (!currentSession) {
      setError('You must sign in first.');
      return;
    }

    try {
      const data = await fetchData('/api/v1/orders', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      setOrders(data);
      setShowOrders(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load orders',
      );
    }
  }

  const menuClassName =
    'absolute top-full right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 text-left text-stone-900 shadow-lg';

  const fieldClassName = 'grid gap-1 text-sm font-medium text-stone-700';

  const inputClassName =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 focus:border-stone-500 focus:outline-none';

  const primaryButtonClassName =
    'w-full cursor-pointer rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2';

  const linkButtonClassName =
    'mt-2 cursor-pointer text-sm text-stone-600 underline underline-offset-4 transition-colors hover:text-stone-900';

  const registerButtonClassName =
    'mt-3 w-full cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50';

  if (loading) {
    return <span className="text-sm text-stone-500">Loading account…</span>;
  }

  if (isPasswordRecovery) {
    return (
      <form
        onSubmit={handlePasswordUpdate}
        className="w-72 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
      >
        <label className={fieldClassName}>
          New password
          <input
            className={inputClassName}
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" className={`${primaryButtonClassName} mt-2`}>
          Update password
        </button>
        {message && (
          <p role="status" className="mt-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    );
  }

  if (session?.user) {
    const roleLabel =
      role === 'admin'
        ? 'Admin'
        : role === 'customer'
          ? 'Registered customer'
          : 'Loading role…';

    return (
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100">
          {session.user.email} ▾
        </summary>

        <div className={menuClassName}>
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-stone-900">
              {session.user.email}
            </p>
            <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
              {roleLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={loadOrders}
              className="cursor-pointer rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              {showOrders ? 'Hide my orders' : 'Load my orders'}
            </button>
          </div>

          {showOrders && orders !== null && (
            <section className="mt-4 border-t border-stone-100 pt-3">
              <h3 className="mb-2 text-sm font-semibold text-stone-900">
                My orders
              </h3>
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500">No orders yet.</p>
              ) : (
                <ul className="max-h-60 space-y-2 overflow-y-auto pr-1 text-sm">
                  {orders.map((order) => (
                    <li
                      key={order.order_id}
                      className="rounded-lg border border-stone-200 bg-stone-50 p-2.5"
                    >
                      <div className="font-medium text-stone-900">
                        Order #{order.order_id} — {order.date}
                      </div>
                      <p className="mt-1 text-stone-600">
                        {order.order_detail || 'No details'}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Status: {order.order_status ?? 'Not set'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </details>
    );
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100">
        Sign in / Register ▾
      </summary>
      <div className={menuClassName}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <label className={fieldClassName}>
                Username
                <input
                  className={inputClassName}
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label className={fieldClassName}>
                Name
                <input
                  className={inputClassName}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label className={fieldClassName}>
            Email
            <input
              className={inputClassName}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className={fieldClassName}>
            Password
            <input
              className={inputClassName}
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className={primaryButtonClassName}>
            {mode === 'register' ? 'Register' : 'Sign in'}
          </button>

          {mode === 'sign-in' && (
            <button
              type="button"
              className={linkButtonClassName}
              onClick={handlePasswordRecovery}
            >
              Forgot password?
            </button>
          )}
        </form>

        <button
          type="button"
          className={registerButtonClassName}
          onClick={() => {
            setMode(mode === 'register' ? 'sign-in' : 'register');
            setError('');
            setMessage('');
          }}
        >
          {mode === 'register' ? 'I already have an account' : 'Register'}
        </button>

        {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}

export default SignInMenu;
