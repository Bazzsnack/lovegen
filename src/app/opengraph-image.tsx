import { ImageResponse } from 'next/og';

export const alt = 'Lovegen - Romance Micro-site Builder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const revalidate = false;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #200020 0%, #000000 100%)',
          color: 'white',
          padding: '40px',
        }}
      >
        <div 
          style={{ 
            fontSize: 100, 
            fontWeight: 'bold', 
            marginBottom: 20,
            textShadow: '0 0 30px rgba(255,102,178,0.5)',
            color: '#ffffff',
            display: 'flex'
          }}
        >
          Lovegen
        </div>
        <div 
          style={{ 
            fontSize: 48, 
            color: '#ffb3d9',
            fontStyle: 'italic',
            display: 'flex'
          }}
        >
          Bikin ayang salting brutal pake web buatan sendiri!
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
