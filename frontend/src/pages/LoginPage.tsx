import { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // This would be implemented with Google OAuth
    alert('Google login not implemented in this demo');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#f5f5f5',
      }}
    >
      <Grid container>
        {/* Left side - Logo */}
        <Grid item xs={12} md={6} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              <span style={{ color: FRIS_COLORS.burgundy }}>FR</span>
              <span style={{ color: FRIS_COLORS.gold }}>i</span>
              <span style={{ color: FRIS_COLORS.green }}>S</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Faculty and REPS Information System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              If you have questions, send us an email through appsdev@post.upm.edu.ph
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Login form */}
        <Grid item xs={12} md={6} 
          sx={{ 
            bgcolor: FRIS_COLORS.burgundy,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%', 
              maxWidth: 450,
              borderRadius: 2,
              borderTop: `4px solid ${FRIS_COLORS.gold}`
            }}
          >
            <Typography variant="h5" component="h1" align="center" gutterBottom>
              University of the Philippines Manila
            </Typography>
            
            <Typography variant="h4" component="h2" align="center" fontWeight="bold" gutterBottom>
              Faculty and REPS Information System
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Login
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  bgcolor: FRIS_COLORS.green,
                  '&:hover': {
                    bgcolor: '#004d34'
                  }
                }}
                disabled={loading}
              >
                Login
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ 
                  py: 1.5,
                  borderColor: '#ccc',
                  color: '#757575'
                }}
              >
                Sign in with Google
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="primary" 
                  sx={{ 
                    cursor: 'pointer',
                    color: FRIS_COLORS.burgundy
                  }}
                >
                  I forgot my password
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
