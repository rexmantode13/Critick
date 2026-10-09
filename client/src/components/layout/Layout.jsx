import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
