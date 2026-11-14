import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';

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
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
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

  async function handleSignOut() {
    const {error: signOutError} = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }

  const menuStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    right: 0,
    zIndex: 1,
    width: 'min(300px, calc(100vw - 4rem))',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  };

  const fieldStyle = {
    display: 'grid',
    gap: '0.3rem',
    marginBottom: '0.75rem',
  };

  if (loading) {
    return <span>Loading account…</span>;
  }

  if (session?.user) {
    return (
      <div style={{position: 'relative', textAlign: 'right'}}>
        <strong>{session.user.email}</strong>
        <div style={{fontSize: '0.9rem', color: '#555', margin: '0.25rem 0'}}>
          {role === 'admin'
            ? 'Admin'
            : role === 'customer'
              ? 'Registered customer'
              : 'Loading role…'}
        </div>
        <button type="button" onClick={handleSignOut}>
          Sign out
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <details style={{position: 'relative'}}>
      <summary style={{cursor: 'pointer'}}>Sign in / Register</summary>
      <div style={menuStyle}>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={fieldStyle}>
                Username
                <input
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label style={fieldStyle}>
                Name
                <input
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

          <button type="submit">
            {mode === 'register' ? 'Register' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          style={{marginTop: '0.75rem'}}
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
