import { parseISO } from 'date-fns';
import fs from 'fs';
import glob from 'glob-promise';
import matter from 'gray-matter';
import path from 'path';
import { getPlaiceholder, IGetPlaiceholderReturn } from 'plaiceholder';
import { capitalizeFirstLetter } from './text-utils';

export const parseMarkdown = async (
  mdPath: string,
  slug: string
): Promise<Record<string, any>> => {
  // get metadata
  const { data: meta, content } = matter(
    fs.readFileSync(mdPath),
    {} // disable caching because gray-matter uses md content (which is often empty) as cache key
  );

  if (!meta.title) {
    const titleParts = slug
      .substr(slug.indexOf('_') + 1)
      .split('-')
      .map((part) => capitalizeFirstLetter(part.trim()));

    meta.title = titleParts.join(' - ');
  }

  if (!meta.image) {
    const images = await glob('{gallery,images}/*.jpg', {
      cwd: path.dirname(mdPath),
    });

    meta.image = images[0] || null;
  }

  return {
    meta,
    content,
  };
};

export const getParentPages = (contentPath: string): string[] => {
  let folderPath = path.resolve('public', contentPath, '../');
  const parentFolders: string[] = [];
  const rootPath = path.resolve('public');
  while (folderPath !== rootPath) {
    parentFolders.push(folderPath);
    folderPath = path.resolve('public', folderPath, '../');
  }

  return parentFolders;
};

export const getParentPagesWithData = <T extends Record<string, string>>(
  contentPath: string
): Promise<{ slug: string; meta: T }[]> => {
  const parentFolders = getParentPages(contentPath);

  return Promise.all(
    parentFolders.map(async (page) => {
      const pathElements = page.split('/');
      const slug = pathElements[pathElements.length - 1];
      let md = null;
      // get metadata
      try {
        md = await parseMarkdown(`${page}/${slug}.mdx`, slug);
      } catch (e) {
        // console.error(e);
        // index.mdx => no meta
      }

      return {
        meta: md?.meta || null,
        slug,
      };
    })
  );
};

/**
 *
 * @param contentPath path relative to 'public' folder
 * @returns
 */
export const getSubPages = (
  contentPath: string,
  level = 1
): Promise<string[]> => {
  const absolutePath = path.resolve(process.cwd(), 'public', contentPath);
  return glob('**/*.mdx', {
    cwd: absolutePath,
  }).then((files) => {
    return files.filter((path) => {
      return level === 0
        ? path.match(/\//g) === null
        : path.match(/\//g)?.length <= level;
    });
  });
};

/**
 *
 * @param contentPath path relative to 'public' folder
 * @returns
 */
export const getSubPagesWithData = async (
  contentPath: string
): Promise<any> => {
  const absolutePath = path.resolve(process.cwd(), 'public', contentPath);

  const subPages = await getSubPages(contentPath, 1).then((subPages) => {
    return Promise.all(
      subPages.map(async (pageName) => {
        const slug = path.dirname(pageName);

        const md = await parseMarkdown(`${absolutePath}/${pageName}`, slug);
        const meta = md.meta;
        // generate placeholder image
        const imageProps = await fetchImageProps(
          `/${contentPath}/${slug}/${meta.image ? meta.image : slug + '.jpg'}`
        );

        return {
          imageProps,
          slug: slug.substr(slug.indexOf('_') + 1),
          meta,
        };
      })
    );
  });

  return subPages.sort((a, b) => {
    if (a.meta.order && b.meta.order) {
      return a.meta.order - b.meta.order;
    } else if (a.meta.date && b.meta.date) {
      const dateA = parseISO(a.meta.date).getTime();
      const dateB = parseISO(b.meta.date).getTime();
      return dateA - dateB;
    }

    return 0;
  });
};

export type ImageProps = IGetPlaiceholderReturn['img'] & {
  blurDataURL: string;
};

export const fetchImageProps = async (
  imagePath: string
): Promise<ImageProps> => {
  const { base64, img } = await getPlaiceholder(imagePath).catch(async () => {
    return getPlaiceholder('/images/placeholder.png');
  });

  return {
    blurDataURL: base64,
    ...img,
  };
};
