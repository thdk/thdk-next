import { PropsWithChildren } from 'react';
import { format } from 'date-fns';

export function Article({
  title,
  date,
  children,
}: PropsWithChildren<{
  title: string;
  date?: Date;
}>): JSX.Element {
  return (
    <article>
      <h1 className="mb-3 text-gray-900 dark:text-white">{title}</h1>
      {date && (
        <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">
          {format(date, 'MMMM dd, yyyy')}
        </p>
      )}
      <div>{children}</div>
    </article>
  );
}
