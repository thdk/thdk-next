import Link from 'next/link';
import React from 'react';
import { CONTENT_PAGE_CATEGORIES } from '../constants';
import { capitalizeFirstLetter } from '../utils/text-utils';

const Navigation = (): JSX.Element => {
  return (
    <nav>
      <Link href="/">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Home</a>
      </Link>
      <Link href="/about">
        <a className="text-gray-900 dark:text-white px-6 py-4">About</a>
      </Link>
      {CONTENT_PAGE_CATEGORIES.map((category) => (
        <Link href={`/${category}`} key={category}>
          <a className="text-gray-900 dark:text-white px-6 py-4">
            {capitalizeFirstLetter(category)}
          </a>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
