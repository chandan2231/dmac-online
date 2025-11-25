import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MorenButton from '../../../components/button';

describe('MorenButton', () => {
  test('renders button with text', () => {
    render(<MorenButton>Click Me</MorenButton>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<MorenButton onClick={handleClick}>Click Me</MorenButton>);
    const buttonElement = screen.getByText(/Click Me/i);
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders contained variant correctly', () => {
    render(<MorenButton variant="contained">Contained</MorenButton>);
    const buttonElement = screen.getByText(/Contained/i);
    expect(buttonElement).toHaveClass('MuiButton-contained');
  });

  test('renders outlined variant correctly', () => {
    render(<MorenButton variant="outlined">Outlined</MorenButton>);
    const buttonElement = screen.getByText(/Outlined/i);
    expect(buttonElement).toHaveClass('MuiButton-outlined');
  });

  test('is disabled when disabled prop is passed', () => {
    render(<MorenButton disabled>Disabled</MorenButton>);
    const buttonElement = screen.getByText(/Disabled/i).closest('button');
    expect(buttonElement).toBeDisabled();
  });
});
