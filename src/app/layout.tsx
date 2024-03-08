import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Header } from '@/components/header';
import { CssBaseline } from '@mui/material';
import { NewProjectDialog } from '@/components/dialog/NewProjectDialog';
import { OpenProjectDialog } from '@/components/dialog/OpenProjectDialog';
import { NewPageDialog } from '@/components/dialog/NewPageDialog';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
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