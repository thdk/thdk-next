import Image from 'next/image';

export const ArticleImage: React.FC<{
  src: string;
  basePath: string;
  width?: number;
  height?: number;
  caption?: string;
}> = ({ basePath, src, width = 16, height = 9, caption }) => {
  const fullSrc = `${basePath}/${src}`;
  return (
    <div className="relative mb-4">
      <Image
        src={fullSrc}
        layout="responsive"
        objectFit="cover"
        width={width}
        height={height}
        unoptimized
      />
      {caption && <div>{caption}</div>}
    </div>
  );
};
