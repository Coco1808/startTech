'use client';
import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as EmotionCacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../src/theme/theme'; // 确保这个路径是正确的，指向你的MUI主题文件
import createEmotionCache from '../lib/createEmotionCache'; // 从正确的相对路径导入

// Client-side cache, shared for the whole session of the user in the browser.
// This ensures that on the client, Emotion's cache is created only once.
const clientSideEmotionCache = createEmotionCache();

export default function ThemeRegistry(props: { children: React.ReactNode }) {
  const { children } = props;

  // For SSR, a new cache instance is created for each request implicitly.
  // On the client, we reuse the clientSideEmotionCache.
  const emotionCache = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return createEmotionCache();
    }
    return clientSideEmotionCache;
  }, []);

  useServerInsertedHTML(() => {
    // This hook runs only on the server.
    // We collect the styles inserted by Emotion during this server render.
    const { inserted, key } = emotionCache;
    const names = Object.keys(inserted).join(' ');

    // No explicit clearing of emotionCache.inserted is needed here.
    // For SSR, a fresh cache is used per request.

    return (
      <style
        data-emotion={`${key} ${names}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(inserted).join(' '),
        }}
      />
    );
  });

  return (
    <EmotionCacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kicks off a nice, clean baseline style. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
} 