import { parseISO } from 'date-fns';
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
import { ContentPageMeta } from '../../types/post';
import {
  fetchImageProps,
  getParentPagesWithData,
  getSubPages,
  getSubPagesWithData,
  ImageProps,
  parseMarkdown,
} from '../../utils/content-utils';
import { parseExif } from '../../utils/parse-exif';

import { CONTENT_PAGE_CATEGORIES } from '../../constants';
import glob from 'glob-promise';
import { useRouter } from 'next/router';
import { Article } from '../../components/article';
import { PageContextProvider } from '../../contexts/page-context';
import { ExifTags } from 'ts-exif-parser';
import { ArticleImage } from '../../components/article-image';

type PostPageProps = {
  source: MDXRemoteSerializeResult;
  frontMatter: ContentPageMeta;
  images: {
    imageProps: ImageProps;
    imageExif: ExifTags;
  }[];
  subPages: any[];
  parents: {
    slug: string;
    meta: MetaProps;
  }[];
  basePath: string;
};

const ContentPage = ({
  basePath,
  source,
  frontMatter,
  images,
  subPages,
  parents,
}: PostPageProps): JSX.Element => {
  const { title, description, image, date } = frontMatter || {};

  const customMeta: MetaProps = {
    title: `${title}`,
    description: description,
    image: `${WEBSITE_HOST_URL}${image}`,
    date: date,
    type: 'article',
  };

  const router = useRouter();
  const { slug: slugParts, category } = router.query;

  const page = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;
  const parentPage = page.substring(0, page.lastIndexOf('/'));
  const components = {
    Head,
    Image: (props: ImageProps) => (
      <ArticleImage {...props} basePath={`/${basePath}`} />
    ),
    Link,
  };

  return (
    <PageContextProvider parents={parents}>
      <Layout customMeta={customMeta}>
        <Article date={date ? parseISO(date) : undefined} title={title}>
          <MDXRemote {...source} components={components} />
        </Article>

        <div className="flex grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          {subPages.map(({ slug: subPage, imageProps, meta: { title } }) => {
            return (
              <Link key={subPage} href={`/${category}/${page}/${subPage}`}>
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
            );
          })}
        </div>

        <div className="grid grid-3 gap-4">
          {images.map(({ imageProps, imageExif }, i) => {
            return (
              <div key={i}>
                <Image {...imageProps} objectFit="contain" placeholder="blur" />
                {imageExif.ImageDescription}
              </div>
            );
          })}
        </div>

        {parents.length > 0 ? (
          <div>
            <Link href={`/${category}/${parentPage}`}>Back to overview</Link>
          </div>
        ) : null}
      </Layout>
    </PageContextProvider>
  );
};

export const getStaticProps: GetStaticProps<any, any> = async ({
  params: { slug: slugs, category },
}) => {
  const folder = Array.isArray(slugs) ? slugs.join('/*') : slugs;

  const articles = await glob(`${folder}/*.mdx`, {
    cwd: path.join(process.cwd(), 'public', category),
  });

  const articlePath = path.join(process.cwd(), 'public', category, articles[0]);
  const absolutePath = path.dirname(articlePath);
  const relativePath = absolutePath.substr(absolutePath.indexOf(category));

  // images
  const images = await glob('gallery/*.jpg', {
    cwd: path.dirname(articlePath),
  }).then((imagePaths) =>
    Promise.all(
      imagePaths.map(async (image) => {
        const imageProps = await fetchImageProps(`/${relativePath}/${image}`);
        const imageExif = await parseExif(`/${absolutePath}/${image}`);
        return {
          imageProps,
          imageExif,
        };
      })
    )
  );

  const articleFolderPath = path.dirname(articlePath);

  const md = await parseMarkdown(
    articlePath,
    articleFolderPath.substr(articleFolderPath.lastIndexOf('/') + 1)
  );

  // meta
  const { content, meta } = md;

  // children
  const subPages = await getSubPagesWithData(relativePath);

  const parents = await getParentPagesWithData(relativePath);

  // parse content
  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [require('remark-code-titles')],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
    scope: meta,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: meta || null,
      images,
      subPages,
      parents,
      basePath: relativePath,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPages = await Promise.all(
    CONTENT_PAGE_CATEGORIES.map(async (category) => {
      const contentPages = await getSubPages(category, 3);

      return contentPages.map((page) => ({
        params: {
          slug: path
            .dirname(page)
            .split('/')
            .map((path) => path.substr(path.indexOf('_') + 1)),
          category,
        },
      }));
    })
  );

  const paths = allPages.flat();

  return {
    paths,
    fallback: false,
  };
};
export default ContentPage;
