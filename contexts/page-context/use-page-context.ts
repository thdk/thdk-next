import { useContext } from 'react';
import { PageContext } from '.';

export function usePageContext() {
  return useContext(PageContext);
}
