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
      data: {session},
    } = await supabase.auth.getSession();

    if (!session) {
      setError('You must sign in first.');
      return;
    }

    try {
      const data = await fetchData('/api/v1/orders', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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

  const menuStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    right: 0,
    zIndex: 1,
    width: 'min(300px, calc(100vw - 4rem))',
    padding: '1rem',
    border: '1px solid #FF8C00',
    borderRadius: '8px',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  };

  const fieldStyle = {
    display: 'grid',
    gap: '0.3rem',
    marginBottom: '0.75rem',
  };

  const inputClassName =
    'w-full rounded border border-gray-400 bg-white px-3 py-2 text-gray-900';

  const primaryButtonClassName =
    'w-full cursor-pointer rounded-md bg-gray-800 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2';

  const linkButtonClassName =
    'mt-2 cursor-pointer text-sm underline underline-offset-4 transition-colors hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2';

  const registerButtonClassName =
    'mt-3 w-full cursor-pointer rounded-md border border-gray-400 px-4 py-2 font-medium transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2';

  if (loading) {
    return <span>Loading account…</span>;
  }

  if (isPasswordRecovery) {
    return (
      <form onSubmit={handlePasswordUpdate}>
        <label style={fieldStyle}>
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
        <button type="submit" className={primaryButtonClassName}>
          Update password
        </button>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    );
  }

  if (session?.user) {
    return (
      <div
        style={{
          position: 'relative',
          textAlign: 'right',
          border: '1px solid rgb(153, 0, 0)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          borderColor: '#3D3B2A',
        }}
      >
        <strong>{session.user.email}</strong>
        <div
          style={{
            fontSize: '0.9rem',
            color: '#3D3B2A' /*#555' <-original*/,
            margin: '0.25rem 0',
          }}
        >
          {role === 'admin'
            ? 'Admin'
            : role === 'customer'
              ? 'Registered customer'
              : 'Loading role…'}
        </div>
        <button type="button" onClick={handleSignOut}>
          Sign out
        </button>
        <button type="button" onClick={loadOrders}>
          {showOrders ? 'Hide my orders' : 'Load my orders'}
        </button>

        {showOrders && orders !== null && (
          <section style={{textAlign: 'left'}}>
            <h3>My orders</h3>
            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <ul>
                {orders.map((order) => (
                  <li key={order.order_id}>
                    <strong>Order #{order.order_id}</strong> — {order.date}
                    <p>{order.order_detail || 'No details'}</p>
                    <p>Status: {order.order_status ?? 'Not set'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <details style={{position: 'relative'}}>
      <summary style={{cursor: 'pointer'}}>Sign in / Register</summary>
      <div style={menuStyle} className="text-gray-900">
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={fieldStyle}>
                Username
                <input
                  className={inputClassName}
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label style={fieldStyle}>
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

          <label style={fieldStyle}>
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

          <label style={fieldStyle}>
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

        {message && <p>{message}</p>}
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  );
}

export default SignInMenu;
