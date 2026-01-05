import { Outlet } from 'react-router-dom';
import Header from './Header';

function Layout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
