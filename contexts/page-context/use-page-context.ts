import { useContext } from 'react';
import { PageContext } from '.';

export function usePageContext(): PageContext {
  return useContext(PageContext);
}
