import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import React from 'react';
import Layout from '../../components/layout';

import { getSubPagesWithData, ImageProps } from '../../utils/content-utils';
import { ContentPageMeta } from '../../types/post';
import { CONTENT_PAGE_CATEGORIES } from '../../constants';

type ContentPageProps = {
  pages: {
    imageProps: ImageProps;
    slug: string;
    meta: ContentPageMeta;
  }[];
  category: string;
};

const ContentCategoryPage = ({
  pages,
  category,
}: ContentPageProps): JSX.Element => {
  return (
    <Layout>
      <h1 className="capitalize">{category}</h1>

      <div className="flex grid grid-cols-1 md:grid-cols-3 gap-2">
        {pages.map(({ slug, imageProps, meta: { title } }) => (
          <Link key={slug} href={`/${category}/${slug}`}>
            <div>
              <div className="truncate">{title}</div>
              <Image
                {...imageProps}
                sizes="(max-width: 600px) 100vw, 1024/3vw"
                objectFit="contain"
                placeholder="blur"
              />
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<
  any,
  { category: string }
> = async ({ params: { category } }) => {
  const pages = await getSubPagesWithData(category);
  return {
    props: {
      category,
      pages,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = CONTENT_PAGE_CATEGORIES.map((category) => ({
    params: { category },
  }));
  return Promise.resolve({
    paths,
    fallback: false,
  });
};

export default ContentCategoryPage;
