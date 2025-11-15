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
  Divider,
} from '@mui/material';
import {
  Close,
  ExpandMore,
  Lock,
  LockOpen,
  Calculate,
  Info,
  Speed,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
                <ListItemIcon><Calculate sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText
                  primary={t('help.distanceCalc') || 'Distance Calculation'}
                  secondary={t('help.distanceCalcDesc') || 'Enter time and pace, then click the distance calculate button'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Calculate sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText
                  primary={t('help.timeCalc') || 'Time Calculation'}
                  secondary={t('help.timeCalcDesc') || 'Enter distance and pace, then click the time calculate button'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Calculate sx={{ color: '#1b2a41' }} /></ListItemIcon>
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
              {t('help.autoCalculation') || 'Auto-Calculation Mode'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t('help.autoDescription') || 'In auto mode, lock a field to keep it constant while automatically calculating the other fields as you type.'}
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
                  <ListItemIcon><Calculate fontSize="small" sx={{ color: '#1b2a41' }} /></ListItemIcon>
                  <ListItemText primary={t('help.step3') || 'Type values in the other fields - calculations happen instantly!'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Info fontSize="small" sx={{ color: '#666' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockProtection') || 'Locked fields are protected in auto mode'}
                    secondary={t('help.lockProtectionDesc') || 'You can only lock fields with values. In auto mode, locked fields appear grayed out and cannot be edited. Switch to manual mode to edit any field. The lock is automatically released if the field becomes empty.'}
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
                  <ListItemIcon><Lock sx={{ color: '#324a5f' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockDistanceTitle') || 'Lock Distance'}
                    secondary={t('help.lockDistanceDesc') || 'Distance stays constant. Change time or pace to calculate the other.'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Lock sx={{ color: '#324a5f' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('help.lockTimeTitle') || 'Lock Time'}
                    secondary={t('help.lockTimeDesc') || 'Time stays constant. Change distance or pace to calculate the other.'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Lock sx={{ color: '#324a5f' }} /></ListItemIcon>
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
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Speed sx={{ mr: 1 }} />
              {t('help.racePredictor') || 'Race Predictor'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t('help.racePredictorDesc') || 'The Race Predictor uses Jack Daniels\' Running Formula to predict your race times at different distances based on your current performance.'}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('help.racePredictorHow') || 'How it works:'}
              </Typography>
              <Typography variant="body2" paragraph>
                {t('help.racePredictorSteps') || 'Enter a distance and time in the Calculator tab. The app calculates your Performance Index (PI) and predicts times for standard race distances.'}
              </Typography>
            </Box>

            <Box sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              mb: 2
            }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('help.racePredictorFormula') || 'The Formula:'}
              </Typography>
              <Box sx={{ my: 2, fontFamily: 'serif', fontSize: '1rem', lineHeight: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography component="div" sx={{ fontFamily: 'serif', fontSize: '1rem' }}>
                    <i>i</i> = -4.60 + 0.182258<i>v</i> + 0.000104<i>v</i><sup>2</sup>
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography component="div" sx={{ fontFamily: 'serif', fontSize: '1rem' }}>
                    <i>i</i><sub>max</sub> = 0.8 + 0.1894393<i>e</i><sup>-0.012778<i>t</i></sup> + 0.2989558<i>e</i><sup>-0.1932605<i>t</i></sup>
                  </Typography>
                </Box>
                <Box>
                  <Typography component="div" sx={{ fontFamily: 'serif', fontSize: '1rem' }}>
                    PI = (<i>i</i> / <i>i</i><sub>max</sub>) × 100
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {t('help.racePredictorFormulaDesc') || 'where v is velocity (m/min), t is time (minutes), i is intensity, and PI is Performance Index'}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {t('help.racePredictorNote') || 'Note: Predictions assume similar training, conditions, and effort level. Actual results may vary.'}
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
                <ListItemText primary={t('help.tip1') || 'Use auto mode with locked fields for quick "what-if" scenarios - lock your target pace and see how distance affects time.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip2') || 'Only one field can be locked at a time. Locking a new field automatically unlocks the previous one.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip3') || 'Switch to manual mode if you need to edit a locked field, then switch back to auto mode to continue auto-calculation.'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip4') || 'The Speed ↔ Pace Converter helps convert between pace (min/km or min/mi) and speed (km/h or mph).'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info sx={{ color: '#1b2a41' }} /></ListItemIcon>
                <ListItemText primary={t('help.tip5') || 'Switch between metric and imperial units in the settings to match your preference.'} />
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
