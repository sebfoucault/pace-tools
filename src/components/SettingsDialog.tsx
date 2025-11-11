import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  List,
  ListItem,

  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Language,
  Straighten,
  Close,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  unitSystem: 'metric' | 'imperial';
  onUnitSystemChange: (unitSystem: 'metric' | 'imperial') => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  unitSystem,
  onUnitSystemChange,
}) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleUnitSystemChange = (event: any) => {
    onUnitSystemChange(event.target.value);
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {t('settings.title') || 'Settings'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Language sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle1" fontWeight="medium">
              {t('app.changeLanguage') || 'Language'}
            </Typography>
          </Box>

          <List dense>
            {[
              { code: 'en', name: 'English' },
              { code: 'es', name: 'Español' },
              { code: 'fr', name: 'Français' },
              { code: 'de', name: 'Deutsch' },
            ].map((lang) => (
              <ListItem
                key={lang.code}
                button
                selected={i18n.language === lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemText primary={lang.name} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle1" fontWeight="medium">
              {t('settings.unitSystem') || 'Unit System'}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t('settings.unitSystem') || 'Unit System'}</InputLabel>
            <Select
              value={unitSystem}
              label={t('settings.unitSystem') || 'Unit System'}
              onChange={handleUnitSystemChange}
            >
              <MenuItem value="metric">
                {t('settings.metric') || 'Metric (km, min/km, km/h)'}
              </MenuItem>
              <MenuItem value="imperial">
                {t('settings.imperial') || 'Imperial (miles, min/mile, mph)'}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.done') || 'Done'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
