const LOCAL_IMAGE = /^(\/assets\/(?:productos|banners)\/.+)\.(?:png|jpe?g)$/i;

export function optimizedImage(src: string, width?: 320 | 640 | 960 | 1440): string {
  const match = src.match(LOCAL_IMAGE);
  return match ? `${match[1]}${width ? `-${width}` : ''}.avif` : src;
}
