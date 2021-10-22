import { ExifParserFactory, ExifTags } from 'ts-exif-parser';
import fse from 'fs/promises';

export const parseExif = async (path: string): Promise<ExifTags> => {
  const file = await fse.readFile(path);

  const parser = ExifParserFactory.create(file);

  return parser.parse().tags || {};
};
