'use client';

import { Box, Typography, Switch, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, List, ListItem, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
}));

interface AuthSettings {
  id: number;
  email_login_enabled: boolean;
  sso_enabled: boolean;
  organization_domain: string | null;
}

export default function UserManagement() {
  const [selectedView, setSelectedView] = useState('authentication');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null);
  const { data: session } = useSession();
  
  // Fetch auth settings on component mount
  useEffect(() => {
    const fetchAuthSettings = async () => {
      if (!session?.user?.accessToken) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/auth`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch authentication settings');
        }

        const data = await response.json();
        setAuthSettings(data);
      } catch (error) {
        console.error('Error fetching auth settings:', error);
        toast.error('Failed to load authentication settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthSettings();
  }, [session]);

  const handleSettingToggle = async (setting: 'email_login_enabled' | 'sso_enabled') => {
    if (!authSettings || !session?.user?.accessToken) return;

    try {
      setIsSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/auth/${authSettings.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...authSettings,
          [setting]: !authSettings[setting],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setAuthSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Box sx={{ width: 250, borderRight: '1px solid', borderColor: 'grey.200', p: 2 }}>
        <Typography className='text-base' sx={{ p: 2, color: 'grey.500' }}>
          User management console
        </Typography>
        <List>
          <ListItem disablePadding>
            <StyledListItemButton
              selected={selectedView === 'authentication'}
              onClick={() => setSelectedView('authentication')}
              sx={{ my: 0.5 }}
            >
              <ListItemText primary="Authentication settings" />
            </StyledListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <StyledListItemButton
              selected={selectedView === 'users'}
              onClick={() => setSelectedView('users')}
              sx={{ my: 0.5 }}
            >
              <ListItemText primary="User control" />
            </StyledListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative'
        }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>User management</Typography>
            <Typography variant="body2" color="text.secondary">
              Invite team members to begin collaborating.
            </Typography>
          </div>
        </Box>

        {selectedView === 'authentication' && (
          <div style={{ padding: 3, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Authentication settings</Typography>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : authSettings && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography>Login via email (default)</Typography>
                    <Switch 
                      checked={authSettings.email_login_enabled}
                      onChange={() => handleSettingToggle('email_login_enabled')}
                      disabled={isSaving}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Allows user to sign in with their email.
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography>Single-sign on (SSO)</Typography>
                    <Switch 
                      checked={authSettings.sso_enabled}
                      onChange={() => handleSettingToggle('sso_enabled')}
                      disabled={isSaving}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Allows user to sign in with existing organization email.
                  </Typography>
                </Box>
              </>
            )}
          </div>
        )}

        {selectedView === 'users' && (
          <div style={{ padding: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6">Current users</Typography>
                <Typography variant="h4">-</Typography>
              </Box>
              <Box>
                <Button 
                  variant="contained" 
                  href="/dashboard/billing"
                  sx={{ 
                    bgcolor: 'black',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)'
                    }
                  }}
                >
                  buy seats
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'grey.200' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Users</StyledTableCell>
                    <StyledTableCell>Roles</StyledTableCell>
                    <StyledTableCell>Tags</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* User data will be populated from the backend */}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </Box>
    </Box>
  );
} 