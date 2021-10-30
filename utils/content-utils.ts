import { parseISO } from 'date-fns';
import fs from 'fs';
import glob from 'glob-promise';
import matter from 'gray-matter';
import path from 'path';
import { getPlaiceholder, IGetPlaiceholderReturn } from 'plaiceholder';

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
      let meta = null;
      // get metadata
      try {
        const mdFile = await fs.promises.readFile(`${page}/${slug}.mdx`);
        const { data } = matter(mdFile);
        meta = data;
      } catch (e) {
        // console.error(e);
        // index.mdx => no meta
      }

      return {
        meta: meta || null,
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
    return files
      .filter((path) => {
        return level === 0
          ? path.match(/\//g) === null
          : path.match(/\//g)?.length <= level;
      })
      .map((mdFileName) => mdFileName.replace('.mdx', ''));
  });
};

/**
 *
 * @param contentPath path relative to 'public' folder
 * @returns
 */
export const getSubPagesWithData = async (
  contentPath: string,
  {
    level = 1,
  }: {
    level?: number;
    order?: 'asc' | 'desc';
  } = {}
): Promise<any> => {
  const absolutePath = path.resolve(process.cwd(), 'public', contentPath);

  const subPages = await getSubPages(contentPath, level).then((subPages) => {
    return Promise.all(
      subPages.map(async (pageName) => {
        const slug = path.basename(pageName, '.mdx');
        // get metadata
        const { data: meta } = matter(
          fs.readFileSync(`${absolutePath}/${pageName}.mdx`)
        );

        // generate placeholder image
        const imageProps = await fetchImageProps(
          `/${contentPath}/${pageName}.jpg`
        );

        return {
          imageProps,
          slug,
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
