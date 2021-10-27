import React from 'react';
import { MetaProps } from '../types/layout';
import { Breadcrumbs } from './breadcrumbs';
import Head from './head';
import Navigation from './navigation';
import ThemeSwitch from './theme-switch';

type LayoutProps = {
  children: React.ReactNode;
  customMeta?: MetaProps;
};

export const WEBSITE_HOST_URL = process.env.WEBSITE_HOST_URL;

const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  return (
    <>
      <Head customMeta={customMeta} />
      <header>
        <div className="max-w-5xl px-8 mx-auto">
          <div className="flex items-center justify-between py-6">
            <Navigation />
            <ThemeSwitch />
          </div>
          <Breadcrumbs />
        </div>
      </header>
      <main>
        <div className="max-w-5xl px-8 py-4 mx-auto">{children}</div>
      </main>
      <footer className="py-8">
        <div className="max-w-5xl px-8 mx-auto">Built by Thomas Dekiere</div>
      </footer>
    </>
  );
};

export default Layout;
