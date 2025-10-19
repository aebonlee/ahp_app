import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders different variants correctly', () => {
    const variants: Array<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'> = 
      ['primary', 'secondary', 'success', 'warning', 'error', 'outline', 'ghost'];
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('renders different sizes correctly', () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Loading state should disable the button
  });

  it('accepts different button types', () => {
    const types: Array<'button' | 'submit' | 'reset'> = ['button', 'submit', 'reset'];
    
    types.forEach(type => {
      const { unmount } = render(<Button type={type}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-test-class';
    render(<Button className={customClass}>Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('renders children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        Text
      </Button>
    );
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('prevents click when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('disabled');
  });

  it('handles keyboard events', async () => {
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Keyboard Test</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('maintains focus after click', async () => {
    render(<Button>Focus Test</Button>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(button).toHaveFocus();
  });
});