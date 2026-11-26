import {Link} from 'react-router-dom';
import SignInMenu from './SignInMenu';

function Header() {
  const headerLinkClass =
    'underline-offset-4 hover:underline focus-visible:underline';
  return (
    <header className="w-full bg-white border-b border-stone-200 shadow-xs mb-8">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="Bistro Liekki etusivu"
          className="text-lg font-bold text-red-800 hover:text-red-900 transition-colors whitespace-nowrap"
        >
          RaffiAla
        </Link>

        <nav aria-label="Päänavigaatio" className="flex gap-5">
          <Link className={headerLinkClass} to="/#menu">
            Menu
          </Link>
          <Link className={headerLinkClass} to="/lunch-menu">
            Lounasmenu
          </Link>
          <Link className={headerLinkClass} to="/#cart">
            Ostoskori
          </Link>
        </nav>

        <SignInMenu />
      </div>
    </header>
  );
}

export default Header;
