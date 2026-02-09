import { useEffect, useState } from 'react';

interface IProgressiveImageProps {
  placeholderSrc: string;
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

const ProgressiveImage = ({
  placeholderSrc,
  src,
  alt = '',
  width = '100%',
  height = 'auto',
}: IProgressiveImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
    };
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    />
  );
};

export default ProgressiveImage;
