import { createContext, PropsWithChildren } from 'react';

export type PageContext = {
  parents: any[];
};

export const PageContext = createContext<PageContext>({} as PageContext);

export function PageContextProvider({
  parents,
  children,
}: PropsWithChildren<{ parents: PageContext['parents'] }>): JSX.Element {
  return (
    <PageContext.Provider value={{ parents }}>{children}</PageContext.Provider>
  );
}
