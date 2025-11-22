import React from 'react';
import { Snackbar, Button } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateSnackbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [needRefresh, setNeedRefresh] = React.useState<(() => void) | null>(null);

  const { offlineReady, needRefresh: nr, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // r is the registration (can be used for debugging)
    },
    onRegisterError(error) {
      // console.error('SW registration error', error);
    },
  });

  React.useEffect(() => {
    if (nr) {
      setNeedRefresh(() => () => updateServiceWorker(true));
      setOpen(true);
    }
  }, [nr, updateServiceWorker]);

  if (!offlineReady && !nr) return null;

  return (
    <Snackbar
      open={open}
      message={nr ? 'A new version is available' : 'App ready to work offline'}
      action={
        nr ? (
          <Button color="inherit" size="small" onClick={() => {
            if (needRefresh) needRefresh();
          }}>
            Refresh
          </Button>
        ) : undefined
      }
      onClose={() => setOpen(false)}
    />
  );
};

export default UpdateSnackbar;
