'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodePreviewProps {
  data: string;
  dotStyle: any;
  cornerStyle: any;
  fgColor: string;
  bgColor: string;
  size?: number;
}

export function QRCodePreview({ 
  data, 
  dotStyle, 
  cornerStyle, 
  fgColor, 
  bgColor,
  size = 256 
}: QRCodePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      dotsOptions: {
        color: fgColor,
        type: dotStyle
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerStyle
      }
    });

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.current.append(ref.current);
    }
  }, [size]);

  useEffect(() => {
    if (!qrCode.current) return;
    qrCode.current.update({
      data: data,
      dotsOptions: { color: fgColor, type: dotStyle },
      cornersSquareOptions: { color: fgColor, type: cornerStyle },
      backgroundOptions: { color: bgColor }
    });
  }, [data, dotStyle, cornerStyle, fgColor, bgColor]);

  return <div ref={ref} className="overflow-hidden rounded-xl bg-white shadow-xl" />;
}
