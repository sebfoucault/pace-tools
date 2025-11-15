import theme from '../theme';

// Centralized tokens for spacing, radii, and frequently used colors
export const tokens = {
  sectionPadding: 3, // used as sx p: tokens.sectionPadding
  sectionHeaderMarginBottom: 1.5,
  smallRadius: 1,
  mediumRadius: 2,
  headerColor: theme.palette.primary.main,
  tableHeaderBg: theme.palette.grey[100],
  dividerColor: 'divider' as const,
  actionHover: 'action.hover' as const,
  actionActive: 'action.active' as const,
  appBackgroundGradient: 'linear-gradient(135deg, #f8f9fa 0%, #ccc9dc 100%)',
  appBarGradient: 'linear-gradient(90deg, #0c1821 0%, #1b2a41 100%)',
  appBarBorder: '1px solid rgba(255,255,255,0.1)',
  chipSelectedGradient: 'linear-gradient(90deg, #1b2a41 0%, #324a5f 100%)',
  gaugeExcellent: '#4caf50',
  gaugeGood: '#42a5f5',
  gaugeModerate: '#ff9800',
  gaugeLow: '#f44336',
  gaugeNeutralText: '#9e9e9e',
  gaugeInnerCircleStroke: 'rgba(0, 0, 0, 0.12)',
  gaugeBackgroundArcStroke: 'rgba(0, 0, 0, 0.1)',
};

export default tokens;
