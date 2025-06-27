import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Plant Predict', path: '/plant-predict' },
  { label: 'Predict', path: '/predict' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: 'center', py: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        GRIDVISION
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={Link}
            to={item.path}
            sx={{
              borderRadius: 1,
              mx: 2,
              my: 0.5,
              '&:hover': {
                backgroundColor: '#f0f4ff',
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: '#ffffff',
        color: '#0a0a0a',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '1.5rem',
          }}
        >
          GRIDVISION
        </Typography>

        {/* Desktop Nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                color: '#0a0a0a',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          color="inherit"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { backgroundColor: '#ffffff' } }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}