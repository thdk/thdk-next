import Image from 'next/image';

export const ArticleImage: React.FC<{
  src: string;
  basePath: string;
  width?: number;
  height?: number;
  caption?: string;
  portrait?: boolean;
}> = ({ basePath, src, width, height, caption, portrait }) => {
  const fullSrc = `${basePath}/${src}`;
  return (
    <div className="relative mb-4">
      <Image
        src={fullSrc}
        layout="responsive"
        objectFit="cover"
        width={width || portrait ? 10 : 16}
        height={height || portrait ? 16 : 10}
        unoptimized
      />
      {caption && <div>{caption}</div>}
    </div>
  );
};
