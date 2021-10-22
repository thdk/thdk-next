import { Post } from './post';

export interface MetaProps
  extends Pick<Post, 'date' | 'description' | 'image' | 'title'> {
  /**
   * For the meta tag `og:type`
   */
  type?: string;
}
