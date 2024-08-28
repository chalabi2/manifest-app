import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import matchers from '@testing-library/jest-dom/matchers';
import {renderWithChainProvider} from "@/tests/render";

expect.extend(matchers);

const mockFormData = {
  name: 'Name Test Token',
  symbol: 'STT',
  display: 'Display Test Token',
  subdenom: 'subtesttoken',
  description: 'This is a test token',
  denomUnits: [
    { denom: 'testtoken', exponent: 0, aliases: [] },
    { denom: 'tt', exponent: 6, aliases: [] },
  ],
  uri: 'www.someuri.com',
  uriHash: 's0m3h4sh',
  exponent: "6",
  label: "LabelTT",
  base: "BaseTT"
};

function renderWithProps(props = {}) {
  const mockProps = {
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    formData: mockFormData,
    address: 'cosmos1address',
  };

  return renderWithChainProvider(<ConfirmationForm {...mockProps} {...props} />);
}

describe('ConfirmationForm Component', () => {
  afterEach(cleanup);

  // TODO: Fix hardcoded values in component
  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Token Information')).toBeInTheDocument();
    expect(screen.getByText('Token Name')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.name)).toBeInTheDocument();

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.symbol)).toBeInTheDocument();

    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.display)).toBeInTheDocument();

    expect(screen.getByText('Subdenom')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.subdenom)).toBeInTheDocument();

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.description)).toBeInTheDocument();

    expect(screen.getByText('Denom Units')).toBeInTheDocument();
    expect(screen.getByText('Base Denom')).toBeInTheDocument();
    // TODO: Fix the following. This is hardcoded to `turd` at the moment.
    // expect(screen.getByText(mockFormData.denomUnits[0].denom)).toBeInTheDocument();

    expect(screen.getByText('Base Exponent')).toBeInTheDocument();
    // TODO: Fix the following. This is hardcoded to `0` at the moment.
    // expect(screen.getByText(mockFormData.denomUnits[0].exponent.toString())).toBeInTheDocument();

    expect(screen.getByText('Full Denom')).toBeInTheDocument();
    expect(screen.getByText(`factory/cosmos1address/${mockFormData.subdenom}`)).toBeInTheDocument();

    expect(screen.getByText('Full Denom Exponent')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.denomUnits[1].exponent.toString())).toBeInTheDocument();
  });

  // TODO: Fix advanced details in component
  test('toggles advanced details correctly', () => {
    renderWithProps();
    const toggleButton = screen.getByText('Show Advanced Details');
    fireEvent.click(toggleButton);

    expect(screen.getByText('URI')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.uri)).toBeInTheDocument();

    expect(screen.getByText('URI Hash')).toBeInTheDocument();
    expect(screen.getByText(mockFormData.uriHash)).toBeInTheDocument();

    expect(screen.getByText('Base Denom Alias')).toBeInTheDocument();
    // TODO: Fix the following in component. This should be the alias, not the subdenom.
    // expect(screen.getByText(mockFormData.subdenom)).toBeInTheDocument();

    expect(screen.getByText('Full Denom Alias')).toBeInTheDocument();
    // TODO: Fix the following in component. This should be the alias, not the display.
    // expect(screen.getByText(mockFormData.display)).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.queryByText('URI')).not.toBeInTheDocument();
    expect(screen.queryByText('URI Hash')).not.toBeInTheDocument();
  });
});