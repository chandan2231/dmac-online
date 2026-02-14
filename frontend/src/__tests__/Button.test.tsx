import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import MorenButton from '../components/button';

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
    userEvent.click(buttonElement);
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
