import { Alert, Anchor, Button, Container, Group, Title } from '@mantine/core';
import { NavLink, Outlet } from 'react-router-dom';
import { isDemo } from '../api';
import { useAuth } from '../auth';
import { resetDemo } from '../demo/demoApi';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/invoices', label: 'Invoices' },
];

export function Layout() {
  const { logout } = useAuth();

  function handleReset() {
    resetDemo();
    window.location.reload();
  }

  return (
    <>
      {isDemo && (
        <Alert color="yellow" variant="light" radius={0} py="xs">
          <Group justify="center" gap="xs">
            <span>
              <b>Demo mode:</b> sample data stored only in your browser. Nothing is sent to a server.
            </span>
            <Anchor component="button" type="button" size="sm" onClick={handleReset}>
              Reset demo data
            </Anchor>
          </Group>
        </Alert>
      )}
      <Container size="lg" py="md">
        <Group justify="space-between">
          <Group gap="lg">
            <Title order={3}>KosKu</Title>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 700 : 400,
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </Group>
          <Button variant="default" size="xs" onClick={logout}>
            Log out
          </Button>
        </Group>
      </Container>
      <Container size="lg" pb="xl">
        <Outlet />
      </Container>
    </>
  );
}
