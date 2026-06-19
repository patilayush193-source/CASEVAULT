'use client';

import dynamic from 'next/dynamic';

const BackgroundCanvas = dynamic(
  () => import('./BackgroundScene'),
  { ssr: false },
);

export default BackgroundCanvas;
