import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePageContext } from '../contexts/page-context/use-page-context';

export const Breadcrumbs: FC = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState(null);

  const { parents } = usePageContext();

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split('/');

      // remove home page
      linkPath.shift();

      // remove current page
      linkPath.pop();

      const pathArray = linkPath.map((slug, i) => {
        const data = parents ? parents[parents.length - 1 - i] : undefined;
        return {
          data,
          slug,
          href: '/' + linkPath.slice(0, i + 1).join('/'),
        };
      });

      setBreadcrumbs(pathArray);
    }
  }, [router]);

  if (!breadcrumbs?.length) {
    return null;
  }

  return (
    <nav aria-label="breadcrumbs">
      <div className="breadcrumbs flex">
        {breadcrumbs.map((breadcrumb, i) => {
          const seperator =
            i < breadcrumbs.length - 1 ? (
              <span className="mx-2 mb-8">/</span>
            ) : null;
          const crumb = (
            <Link href={breadcrumb.href}>
              <a>{breadcrumb.data?.meta?.title || breadcrumb.slug}</a>
            </Link>
          );

          return (
            <React.Fragment key={breadcrumb.slug}>
              <div key={breadcrumb.href} className="capitalize">
                {crumb}
              </div>
              {seperator}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
