import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideMenu from './SideMenu';

// FRIS logo colors: burgundy, green, and gold
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: FRIS_COLORS.burgundy }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              <span style={{ color: '#fff' }}>FR</span>
              <span style={{ color: FRIS_COLORS.gold }}>iS</span>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <SideMenu open={menuOpen} onClose={toggleMenu} />
    </>
  );
};

export default Header;
