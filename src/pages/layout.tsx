import { Component } from "react";
import { ColorModeProvider } from "../theme/ColorModeContext";

export const metadata = {
    title: 'My App',
    description: 'MUI + Next.js App Router',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ColorModeProvider>
                    <Component>{children}</Component>
                </ColorModeProvider>
            </body>
        </html>
    );
}
