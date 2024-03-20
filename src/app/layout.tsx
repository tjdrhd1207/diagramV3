import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                {/* <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script> */}
            </head>
            <body>
                <AppRouterCacheProvider>
                    {/* <CssBaseline> */}
                        {/* <Header /> */}
                        {children}
                        {/* <NewPageDialog />
                        <NewProjectDialog />
                        <OpenProjectDialog /> */}
                    {/* </CssBaseline> */}
                </AppRouterCacheProvider>
            </body>
        </html>
    )
}