import './globals.css'
import React from 'react';

export default async function Page({ children }: { children: React.ReactNode }) {


  return <html>
    <body>
      {children}
    </body>
  </html>;
}