import { afterEach, describe, expect, jest, test, mock, afterAll } from 'bun:test';
import React from 'react';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import ConfirmationModal from '@/components/groups/forms/proposals/ConfirmationForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposalFormData } from '@/tests/mock';

expect.extend(matchers);

// Mock useFeeEstimation
mock.module('@/hooks/useFeeEstimation', () => ({
  useFeeEstimation: jest.fn().mockReturnValue({
    estimateFee: jest.fn().mockResolvedValue({
      amount: [{ amount: '5000', denom: 'umfx' }],
      gas: '200000',
    }),
  }),
}));

mock.module('@/hooks/useIpfs', () => ({
  useIPFSFetch: jest.fn().mockReturnValue({
    data: 'mocked data',
    loading: false,
    error: null,
  }),
  uploadJsonToIPFS: jest.fn(),
}));

const mockProps = {
  policyAddress: 'manifest1policy',
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  address: 'cosmos1address',
};

describe('ConfirmationModal Component', () => {
  afterEach(cleanup);
  afterAll(() => {
    mock.restore();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByLabelText('proposal-details')).toBeInTheDocument();
    expect(screen.getByText(mockProposalFormData.title)).toBeInTheDocument();
    expect(screen.getByText('manifest1hj5fv...8ws9ct')).toBeInTheDocument();

    // TODO: This is never displayed in the component
    // expect(screen.getByText(mockFormData.summary)).toBeInTheDocument();

    expect(screen.getByText('MESSAGES')).toBeInTheDocument();
    expect(screen.getByText('METADATA')).toBeInTheDocument();
    expect(screen.getByLabelText('meta-details')).toBeInTheDocument();
    expect(screen.getByText(mockProposalFormData.metadata.title)).toBeInTheDocument();
    expect(screen.getByText(mockProposalFormData.metadata.summary)).toBeInTheDocument();
    expect(screen.getByText(mockProposalFormData.metadata.details)).toBeInTheDocument();
  });

  test('calls prevStep when "Prev: Metadata" button is clicked', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const prevButton = screen.getByText('Prev: Metadata');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });

  test('disables "Sign Transaction" button when isSigning is true', () => {
    renderWithChainProvider(<ConfirmationModal {...mockProps} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });

  test('disables "Sign Transaction" button when address is not provided', () => {
    const propsWithoutAddress = { ...mockProps, address: '' };
    renderWithChainProvider(<ConfirmationModal {...propsWithoutAddress} />);
    const signButton = screen.getByText('Sign Transaction');
    fireEvent.click(signButton);
    expect(signButton).toBeDisabled();
  });
});
