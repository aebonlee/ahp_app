import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/common/Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });

  test('handles click event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-blue-500');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-gray-500');

    rerender(<Button variant="error">Error</Button>);
    button = screen.getByText('Error');
    expect(button).toHaveClass('bg-red-500');
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  test('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading...');
    expect(button).toBeDisabled();
  });

  test('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByText('Small');
    expect(button).toHaveClass('px-3', 'py-1');

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByText('Medium');
    expect(button).toHaveClass('px-4', 'py-2');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByText('Large');
    expect(button).toHaveClass('px-6', 'py-3');
  });
});