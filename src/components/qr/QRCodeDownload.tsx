'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeDownloadProps {
  data: string;
  dotStyle: any;
  cornerStyle: any;
  fgColor: string;
  bgColor: string;
  fileName?: string;
}

export function QRCodeDownload({ 
  data, 
  dotStyle, 
  cornerStyle, 
  fgColor, 
  bgColor,
  fileName = 'lovegen-qr'
}: QRCodeDownloadProps) {
  
  const handleDownload = () => {
    const qrCode = new QRCodeStyling({
      width: 1024,
      height: 1024,
      data: data,
      margin: 20,
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

    qrCode.download({
      name: fileName,
      extension: 'png'
    });
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="gap-2">
      <Download size={18} />
      Download High-Res QR
    </Button>
  );
}
