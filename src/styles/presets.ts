import { SxProps, Theme } from '@mui/material/styles';
import { tokens } from './tokens';

export const presets: Record<string, SxProps<Theme>> = {
  pageBackground: {
    flexGrow: 1,
    minHeight: '100vh',
    background: tokens.appBackgroundGradient,
  },
  appBar: {
    background: tokens.appBarGradient,
    backdropFilter: 'blur(10px)',
    borderBottom: tokens.appBarBorder,
  },
  cardContent: {
    p: 3,
    position: 'relative',
  },
  title: {
    color: tokens.headerColor,
  },
  tableHeaderRow: {
    backgroundColor: tokens.tableHeaderBg,
  },
  hoverRow: {
    '&:hover': {
      backgroundColor: 'background.default',
    },
  },
};

export default presets;
