import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import NewTicket from '@/app/(tabs)/new';
import TicketList from '@/app/(tabs)/index';
import SignIn from '@/app/sign-in';
import { DataProvider, useData } from '@/lib/DataProvider';
import { Role } from '@/lib/types';

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    router: { push: (...args: unknown[]) => mockPush(...args) },
    Link: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (asChild ? children : <Text>{children}</Text>),
  };
});

function AsRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, demoSignIn } = useData();
  React.useEffect(() => {
    if (!user) demoSignIn(role);
  }, [user, role, demoSignIn]);
  return user ? <>{children}</> : null;
}

const renderAs = async (role: Role, ui: React.ReactElement) =>
  await render(
    <DataProvider>
      <AsRole role={role}>{ui}</AsRole>
    </DataProvider>,
  );

beforeEach(() => mockPush.mockClear());

describe('SignIn screen', () => {
  it('offers the demo role picker and validates email', async () => {
    await render(<DataProvider><SignIn /></DataProvider>);
    expect(screen.getByText('Demo mode: continue as…')).toBeTruthy();
    expect(screen.getByText('Technician (Sam, IT)')).toBeTruthy();
    await fireEvent.press(screen.getByText('Sign in'));
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });
});

describe('TicketList screen', () => {
  it('shows a requester only their tickets', async () => {
    await renderAs('requester', <TicketList />);
    expect(await screen.findByText(/My tickets · 4 total/)).toBeTruthy();
    expect(screen.queryByText('Printer on 3rd floor jamming')).toBeNull();
  });

  it('filters the technician queue by status', async () => {
    await renderAs('technician', <TicketList />);
    expect(await screen.findByText(/All tickets \(technician view\) · 7 total/)).toBeTruthy();
    expect(screen.getByText('VPN disconnects every 10 minutes')).toBeTruthy();
    await fireEvent.press(screen.getAllByText('Open')[1]); // [0] is the summary card label, [1] the filter chip
    expect(screen.queryByText('VPN disconnects every 10 minutes')).toBeNull();
    expect(screen.getByText('Cannot connect to office Wi-Fi')).toBeTruthy();
  });
});

describe('NewTicket screen', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    await renderAs('requester', <NewTicket />);
    await fireEvent.press(await screen.findByText('Submit ticket'));
    expect(screen.getByText('Title must be at least 5 characters.')).toBeTruthy();
    expect(screen.getByText('Describe the issue in at least 10 characters.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits a valid ticket and navigates to it', async () => {
    await renderAs('requester', <NewTicket />);
    await fireEvent.changeText(await screen.findByPlaceholderText(/Outlook keeps asking/), 'Monitor flickering');
    await fireEvent.changeText(screen.getByPlaceholderText(/What happened/), 'Second screen flickers constantly.');
    await act(async () => {
      await fireEvent.press(screen.getByText('Submit ticket'));
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/ticket/[id]', params: { id: '1043' } });
  });
});
