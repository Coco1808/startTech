'use client';

import { Button, Container, Typography } from '@mui/material';
import { useContext } from 'react';
import { ColorModeContext } from '../theme/ColorModeContext';

export default function Home() {
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to App Router!
      </Typography>
      <Button variant="contained" onClick={toggleColorMode}>
        Toggle Theme
      </Button>
    </Container>
  );
}
