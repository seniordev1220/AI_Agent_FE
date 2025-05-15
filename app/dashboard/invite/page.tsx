'use client';

import { Box, Typography, Switch, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';

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

export default function UserManagement() {
  const [selectedView, setSelectedView] = useState('authentication'); // or 'users'
  
  const users = [
    { email: 'julie@xyz.com', role: 'admin', tags: ['operations'] },
    { email: 'rachel.m@xyz.com', role: 'member', tags: ['marketing'] },
    { email: 'john@xyz.com', role: 'member', tags: ['engineering', 'sales'] },
    { email: 'rl.o@xyz.com', role: 'member', tags: ['HR'] },
    { email: 'bob.smith@xyz.com', role: 'member', tags: ['IT'] },
  ];

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>User management</Typography>
            <Typography variant="body2" color="text.secondary">
              Invite team members to begin collaborating.
            </Typography>
          </div>
        </Box>

        {selectedView === 'authentication' && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Authentication settings</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography>Login via email (default)</Typography>
                <Switch defaultChecked />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Allows user to sign in with their email.
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography>Single-sign on (SSO)</Typography>
                <Switch defaultChecked />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Allows user to sign in with existing organization email.
              </Typography>
            </Box>
          </Paper>
        )}

        {selectedView === 'users' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6">Current users</Typography>
                <Typography variant="h4">5</Typography>
              </Box>
              <Box>
                <Button 
                  variant="outlined" 
                  sx={{ mr: 2 }}
                  startIcon={<AddIcon />}
                >
                  Invite users
                </Button>
                <Button variant="contained" color="primary">
                  Buy seats
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Users</StyledTableCell>
                    <StyledTableCell>Roles</StyledTableCell>
                    <StyledTableCell>Tags</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              color: 'primary.main',
                              bgcolor: 'primary.50',
                            }}
                          />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
} 