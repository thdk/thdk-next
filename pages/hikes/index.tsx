import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import React from 'react';
import Layout from '../../components/layout';

import { getSubPagesWithData, ImageProps } from '../../utils/content-utils';
import { Hike } from '../../types/post';
import { HIKES_PATH } from '../../paths';

type HikesPageProps = {
  hikes: {
    imageProps: ImageProps;
    slug: string;
    meta: Hike;
  }[];
};

const HikesPage = ({ hikes }: HikesPageProps): JSX.Element => {
  return (
    <Layout>
      <h1>Hikes</h1>

      <div className="flex grid grid-cols-1 md:grid-cols-3 gap-2">
        {hikes.map(({ slug, imageProps, meta: { title } }) => (
          <Link key={slug} href={`/hikes/${slug}`}>
            <div>
              {title}
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

export const getStaticProps: GetStaticProps = async () => {
  const hikes = await getSubPagesWithData(HIKES_PATH);
  return {
    props: {
      hikes,
    },
  };
};

export default HikesPage;
