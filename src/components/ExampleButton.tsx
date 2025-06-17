import { Button } from '@mui/material';

interface ExampleButtonProps {
  label: string;
  onClick: () => void;
}

export default function ExampleButton({ label, onClick }: ExampleButtonProps) {
  return (
    <Button variant="outlined" onClick={onClick}>
      {label}
    </Button>
  );
}
