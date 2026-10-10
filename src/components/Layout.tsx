import { Button, Container, Group, Title } from '@mantine/core';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/invoices', label: 'Invoices' },
];

export function Layout() {
  const { logout } = useAuth();

  return (
    <>
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
