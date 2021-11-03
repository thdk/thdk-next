import Image from 'next/image';

export const RelativePathImage = ({
  basePath,
  src,
}: {
  src: string;
  basePath: string;
}) => {
  const fullSrc = `${basePath}/${src}`;
  return (
    <div className="relative aspect-w-16 aspect-h-9">
      <Image src={fullSrc} layout="fill" objectFit="cover" />
    </div>
  );
};
