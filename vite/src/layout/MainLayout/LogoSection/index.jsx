import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

// project imports
import Box from '@mui/material/Box';

import KundyLogo from '../../../assets/images/kundy-logo.png';


// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to="/" aria-label="theme-logo">
      <Box
        component="img"
        src={KundyLogo}
        alt="Kundy Logo"
        sx={{
          height: 50,
          width: '100%',
          objectFit: 'contain',
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </Link>
  );
}
