import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Plant Predict', path: '/plant-predict' },
  { label: 'Grid Optimization', path: '/optimization' },
  { label: 'Solar Calculator', path: '/calculator' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: 'center', py: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        GRIDVISION
      </Typography>
      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 1,
                mx: 2,
                my: 0.5,
                color: isActive ? '#1976d2' : 'inherit',
                backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f0f4ff',
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  sx: isActive ? { textDecoration: 'underline' } : {},
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#0a0a0a',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Container maxWidth="lg" sx={{ maxWidth: '1200px' }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
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
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: isActive ? '#1976d2' : '#0a0a0a',
                    textTransform: 'none',
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
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
      </Container>

      {/* Mobile Drawer */}
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
