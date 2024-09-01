import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import MemberInfoForm from '@/components/groups/forms/groups/MemberInfoForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroupFormData } from '@/tests/mock';

expect.extend(matchers);

// Mock the isValidAddress function
mock.module('@/utils/string', () => ({
  isValidAddress: (address: string) => address.startsWith('manifest1'),
}));

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
  address: 'manifest1address',
};

describe('MemberInfoForm Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  test('renders component with correct details', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    expect(screen.getByText('Member Info')).toBeTruthy();
    expect(screen.getAllByLabelText('Address')[0]).toBeTruthy();
    expect(screen.getAllByLabelText('Name')[0]).toBeTruthy();
    expect(screen.getAllByLabelText('Weight')[0]).toBeTruthy();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const addressInput = screen.getAllByLabelText('Address')[0] as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: 'manifest1newaddress' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'address',
        value: 'manifest1newaddress',
      });
    });

    const nameInput = screen.getAllByLabelText('Name')[0] as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'name',
        value: 'New Name',
      });
    });

    const weightInput = screen.getAllByLabelText('Weight')[0] as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: '3' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MEMBER',
        index: 0,
        field: 'weight',
        value: '3',
      });
    });
  });

  test('next button is disabled when address is invalid', async () => {
    const invalidFormData = {
      ...mockGroupFormData,
      members: [{ address: 'invalid_address', name: 'Test', weight: '1' }],
    };
    renderWithChainProvider(<MemberInfoForm {...mockProps} formData={invalidFormData} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Address')).toHaveValue('invalid_address');
    });
    const addressInput = screen.getByLabelText('Address');
    fireEvent.blur(addressInput);
    await waitFor(
      () => {
        const nextButton = screen.getByText('Next: Group Policy');
        expect(nextButton).toBeDisabled();
      },
      { timeout: 2000 }
    );
  });

  test('next button is enabled when form is valid', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Group Policy');
      expect(nextButton).toBeEnabled();
    });
  });

  test('calls nextStep when next button is clicked', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    await waitFor(() => {
      const nextButton = screen.getByText('Next: Group Policy');
      expect(nextButton).toBeEnabled();
    });
    const nextButton = screen.getByText('Next: Group Policy');
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test('calls prevStep when prev button is clicked', () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const prevButton = screen.getByText('Prev: Group Policy');
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });

  test('increases and decreases number of members correctly', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);
    const increaseButton = screen.getByText('+');
    const decreaseButton = screen.getByText('-');
    const memberCountInput = screen.getByLabelText('member-count') as HTMLInputElement;

    fireEvent.click(increaseButton);
    await waitFor(() => {
      expect(memberCountInput.value).toBe('3');
    });

    fireEvent.click(decreaseButton);
    await waitFor(() => {
      expect(memberCountInput.value).toBe('2');
    });
  });

  test('pastes address when address button is clicked', async () => {
    renderWithChainProvider(<MemberInfoForm {...mockProps} />);

    const addressButton = screen
      .getAllByRole('button')
      .find(
        button =>
          button.classList.contains('btn-primary') && button.classList.contains('rounded-tr-lg')
      );

    expect(addressButton).toBeTruthy();

    if (addressButton) {
      fireEvent.click(addressButton);
      await waitFor(() => {
        expect(mockProps.dispatch).toHaveBeenCalledWith({
          type: 'UPDATE_MEMBER',
          index: 0,
          field: 'address',
          value: mockProps.address,
        });
      });
    }
  });
});
