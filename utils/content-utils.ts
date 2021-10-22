import { parseISO } from 'date-fns';
import fs from 'fs';
import glob from 'glob-promise';
import matter from 'gray-matter';
import path from 'path';
import { getPlaiceholder, IGetPlaiceholderReturn } from 'plaiceholder';

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
  return glob('**/*mdx', {
    cwd: absolutePath,
  }).then((files) =>
    files.filter((path) => path.match(/\//g)?.length <= level)
  );
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
        // get metadata
        const { data: meta } = matter(
          fs.readFileSync(`${absolutePath}/${pageName}`)
        );
        const slug = path.basename(pageName, '.mdx');

        // generate placeholder image
        const imageProps = await fetchImageProps(
          `/${contentPath}/${path.dirname(pageName)}/${slug}.jpg`
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
