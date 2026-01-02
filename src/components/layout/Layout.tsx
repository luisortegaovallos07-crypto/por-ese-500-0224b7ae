import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
