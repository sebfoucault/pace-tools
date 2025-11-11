import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close,
  ExpandMore,
  Straighten,
  Watch,
  DirectionsRun,
  Lock,
  LockOpen,
  Calculate,
  Info,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Enhanced Watch icon with clock hands - simplified and cleaner
const WatchWithHands: React.FC<{ sx?: any; fontSize?: string }> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <Watch sx={{ fontSize }} />
    {/* Hour hand */}
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '25%',
        height: '1.5px',
        backgroundColor: 'currentColor',
        transformOrigin: '0% 50%',
        transform: 'rotate(-50deg)',
        opacity: 0.85,
      }}
    />
    {/* Minute hand */}
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '35%',
        height: '1px',
        backgroundColor: 'currentColor',
        transformOrigin: '0% 50%',
        transform: 'rotate(110deg)',
        opacity: 0.85,
      }}
    />
  </Box>
);

// Enhanced DirectionsRun icon with speed lines
const RunnerWithSpeedLines: React.FC<{ sx?: any; fontSize?: string }> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <DirectionsRun sx={{ fontSize }} />
    <Box
      sx={{
        position: 'absolute',
        left: '-8px',
        top: '30%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <Box sx={{ width: '6px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.6 }} />
      <Box sx={{ width: '8px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.7 }} />
      <Box sx={{ width: '6px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.6 }} />
    </Box>
  </Box>
);

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {t('help.title') || 'How to Use Running Calculator'}
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
          <Typography variant="body1" paragraph>
            {t('help.intro') || 'The Running Calculator helps you calculate distance, time, and pace for your runs. You can use it in two ways: manual calculation or automatic calculation with the lock feature.'}
          </Typography>
        </Box>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Calculate sx={{ mr: 1 }} />
              {t('help.manualCalculation') || 'Manual Calculation'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t('help.manualSteps') || 'Fill in any two fields and click the calculate button next to the third field:'}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><Straighten sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText
                  primary={t('help.distanceCalc') || 'Distance Calculation'}
                  secondary={t('help.distanceCalcDesc') || 'Enter time and pace, then click the distance calculate button'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><WatchWithHands sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText
                  primary={t('help.timeCalc') || 'Time Calculation'}
                  secondary={t('help.timeCalcDesc') || 'Enter distance and pace, then click the time calculate button'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><RunnerWithSpeedLines sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText
                  primary={t('help.paceCalc') || 'Pace Calculation'}
                  secondary={t('help.paceCalcDesc') || 'Enter distance and time, then click the pace calculate button'}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Lock sx={{ mr: 1 }} />
              {t('help.lockFeature') || 'Lock Feature (Auto-Calculation)'}
              <Chip label={t('help.advanced') || 'Advanced'} size="small" color="secondary" sx={{ ml: 1 }} />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t('help.lockDescription') || 'The lock feature allows automatic calculation as you type. When you lock a field, it becomes constant and other fields are calculated automatically.'}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 0.5, fontSize: 16 }} />
                {t('help.howToLock') || 'How to Use Lock:'}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><LockOpen fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t('help.step1') || 'Click the lock icon next to any field to lock it'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Lock fontSize="small" color="secondary" /></ListItemIcon>
                  <ListItemText primary={t('help.step2') || 'The locked field becomes constant (shown with a filled lock icon)'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><RunnerWithSpeedLines fontSize="small" sx={{ color: '#1b2a41' }} /></ListItemIcon>
                  <ListItemText primary={t('help.step3') || 'Type values in the other fields - calculations happen instantly!'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Info fontSize="small" sx={{ color: '#666' }} /></ListItemIcon>
                  <ListItemText 
                    primary={t('help.lockProtection') || 'Locked fields are protected from manual edits'} 
                    secondary={t('help.lockProtectionDesc') || 'You can only lock fields with values. The lock is automatically released if the field becomes empty.'}
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('help.lockExamples') || 'Lock Examples:'}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Straighten sx={{ color: '#324a5f' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockDistanceTitle') || 'Lock Distance'}
                    secondary={t('help.lockDistanceDesc') || 'Distance stays constant. Change time or pace to calculate the other.'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WatchWithHands sx={{ color: '#324a5f' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockTimeTitle') || 'Lock Time'}
                    secondary={t('help.lockTimeDesc') || 'Time stays constant. Change distance or pace to calculate the other.'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><RunnerWithSpeedLines sx={{ color: '#324a5f' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockPaceTitle') || 'Lock Pace'}
                    secondary={t('help.lockPaceDesc') || 'Pace stays constant. Change distance or time to calculate the other.'}
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {t('help.timeFormats') || 'Time Formats'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t('help.timeFormatsDesc') || 'The calculator supports multiple time formats:'}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="MM:SS"
                  secondary={t('help.mmss') || 'Minutes and seconds (e.g., 25:30)'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="HH:MM:SS"
                  secondary={t('help.hhmmss') || 'Hours, minutes, and seconds (e.g., 1:25:30)'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="MM:SS:s"
                  secondary={t('help.mmssms') || 'With precise tenths of seconds (e.g., 25:30:5)'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="HH:MM:SS:s"
                  secondary={t('help.hhmmssms') || 'Full format with tenths (e.g., 1:25:30:5)'}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {t('help.preciseTimeNote') || 'Enable "Precise time" mode to use tenths of seconds in calculations.'}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {t('help.tips') || 'Tips & Tricks'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip1') || 'Use the lock feature for quick "what-if" scenarios - lock your target pace and see how distance affects time.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip2') || 'Only one field can be locked at a time. Locking a new field automatically unlocks the previous one.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip3') || 'The Speed ↔ Pace Converter at the bottom helps convert between different pace and speed units.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip4') || 'Switch between metric and imperial units in the settings to match your preference.'} />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close') || 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
