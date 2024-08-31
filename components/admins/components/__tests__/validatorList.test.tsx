import { afterEach, describe, expect, test } from 'bun:test';
import React from 'react';
import ValidatorList from '@/components/admins/components/validatorList';
import { fireEvent, screen, cleanup, waitFor } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { mockActiveValidators, mockPendingValidators } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    admin: 'admin1',
    activeValidators: mockActiveValidators,
    pendingValidators: mockPendingValidators,
    isLoading: false,
  };
  return renderWithChainProvider(<ValidatorList {...defaultProps} {...props} />);
};

describe('ValidatorList', () => {
  afterEach(cleanup);

  test('renders correctly', () => {
    renderWithProps();
    expect(screen.getByText('Active Validators')).toBeInTheDocument();
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.getByText('Validator Two')).toBeInTheDocument();
  });

  test('search functionality works', () => {
    renderWithProps();
    fireEvent.change(screen.getByPlaceholderText('Search for a validator...'), {
      target: { value: 'Validator One' },
    });
    expect(screen.getByText('Validator One')).toBeInTheDocument();
    expect(screen.queryByText('Validator Two')).not.toBeInTheDocument();
  });

  test('active/pending toggle works', () => {
    renderWithProps();
    fireEvent.click(screen.getByText('Pending'));
    expect(screen.getByText('Pending Validators')).toBeInTheDocument();
    expect(screen.getByText('Validator Three')).toBeInTheDocument();
  });

  test('clicking on a validator row opens the modal', async () => {
    renderWithProps();
    fireEvent.click(screen.getByText('Validator One'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  test('remove button works and shows the warning modal', async () => {
    renderWithProps();
    const allRemoveButtons = screen.getAllByText('Remove');
    fireEvent.click(allRemoveButtons[0]);
    await waitFor(() =>
      expect(screen.getByText('Are you sure you want to remove the validator')).toBeInTheDocument()
    );
  });
});
