import { parseISO } from 'date-fns';
import fs from 'fs';
import matter from 'gray-matter';
import { GetStaticPaths, GetStaticProps } from 'next';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import React from 'react';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import Layout, { WEBSITE_HOST_URL } from '../../components/layout';
import { MetaProps } from '../../types/layout';
import { Hike } from '../../types/post';
import {
  fetchImageProps,
  getParentPagesWithData,
  getSubPages,
  getSubPagesWithData,
  ImageProps,
} from '../../utils/content-utils';
import { HIKES_PATH } from '../../paths';
import glob from 'glob-promise';
import { useRouter } from 'next/router';
import { Article } from '../../components/article';
import { PageContextProvider } from '../../contexts/page-context';

const components = {
  Head,
  Image,
  Link,
};

type PostPageProps = {
  source: MDXRemoteSerializeResult;
  frontMatter: Hike;
  images: ImageProps[];
  subHikes: any[];
  parents: string[];
};

const HikePage = ({
  source,
  frontMatter: { title, description, image, date },
  images,
  subHikes,
  parents,
}: PostPageProps): JSX.Element => {
  const customMeta: MetaProps = {
    title: `${title}`,
    description: description,
    image: `${WEBSITE_HOST_URL}${image}`,
    date: date,
    type: 'article',
  };

  const router = useRouter();
  const { slug: slugParts } = router.query;

  const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;
  return (
    <PageContextProvider parents={parents}>
      <Layout customMeta={customMeta}>
        <Article date={date ? parseISO(date) : undefined} title={title}>
          <MDXRemote {...source} components={components} />
        </Article>

        <div className="flex grid grid-cols-1 md:grid-cols-3 gap-2">
          {subHikes.map(({ slug: subHike, imageProps, meta: { title } }) => {
            return (
              <Link key={subHike} href={`/hikes/${slug}/${subHike}`}>
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
            );
          })}
        </div>

        <div className="grid grid-3 gap-4">
          {images.map((image, i) => (
            <Image key={i} {...image} objectFit="contain" placeholder="blur" />
          ))}
        </div>
      </Layout>
    </PageContextProvider>
  );
};

export const getStaticProps: GetStaticProps<any, any> = async ({
  params: { slug: slugs },
}) => {
  const slug = Array.isArray(slugs) ? slugs[slugs.length - 1] : slugs;
  const folder = Array.isArray(slugs) ? slugs.join('/') : slugs;
  const relativePath = path.join(HIKES_PATH, folder);
  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  // images
  const images = await glob('images/*.jpg', {
    cwd: absolutePath,
  }).then((imagePaths) =>
    Promise.all(
      imagePaths.map((image) => fetchImageProps(`/${relativePath}/${image}`))
    )
  );

  // content
  const source = fs.readFileSync(`${absolutePath}/${slug}.mdx`);

  // meta
  const { content, data } = matter(source);

  // children
  const subHikes = await getSubPagesWithData(relativePath);

  const parents = await getParentPagesWithData(relativePath);

  // parse content
  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [require('remark-code-titles')],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      images,
      subHikes,
      parents,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPages = await getSubPages(HIKES_PATH, 3);

  const paths = allPages.map((page) => ({
    params: { slug: path.dirname(page).split('/') },
  }));

  return {
    paths,
    fallback: false,
  };
};

export default HikePage;
