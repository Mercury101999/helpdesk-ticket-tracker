import { render, screen } from '@testing-library/react-native';
import React from 'react';

import TicketDetail from '@/app/ticket/[id]';
import { DataProvider, useData } from '@/lib/DataProvider';
import { Role } from '@/lib/types';

const params: { id: string } = { id: '1041' };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => params,
  Stack: { Screen: () => null },
}));

function AsRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, demoSignIn } = useData();
  React.useEffect(() => {
    if (!user) demoSignIn(role);
  }, [user, role, demoSignIn]);
  return user ? <>{children}</> : null;
}

const renderAs = (role: Role) =>
  render(
    <DataProvider>
      <AsRole role={role}>
        <TicketDetail />
      </AsRole>
    </DataProvider>,
  );

describe('Ticket detail', () => {
  beforeEach(() => {
    params.id = '1041';
  });

  it('shows technician actions and the comment thread', async () => {
    await renderAs('technician');
    expect(await screen.findByText('Laptop will not power on')).toBeTruthy();
    expect(screen.getByText('Technician actions')).toBeTruthy();
    expect(await screen.findByText(/swap the power adapter/)).toBeTruthy();
    expect(screen.getByText(/Comments \(2\)/)).toBeTruthy();
  });

  it('hides technician actions from the requester who opened the ticket', async () => {
    await renderAs('requester');
    expect(await screen.findByText('Laptop will not power on')).toBeTruthy();
    expect(screen.queryByText('Technician actions')).toBeNull();
  });

  it('explains when the ticket is not visible', async () => {
    params.id = '9999';
    await renderAs('requester');
    expect(await screen.findByText('Ticket unavailable')).toBeTruthy();
    expect(screen.getByText(/cannot see it/)).toBeTruthy();
  });
});
