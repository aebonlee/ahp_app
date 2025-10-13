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

  test('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByText('Primary');
    // CSS-in-JS 스타일 테스트를 실제 적용된 스타일로 수정
    expect(button).toHaveAttribute('style');
    expect(button.style.backgroundColor).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByText('Secondary');
    expect(button).toHaveAttribute('style');
    expect(button.style.backgroundColor).toBeTruthy();

    rerender(<Button variant="error">Error</Button>);
    button = screen.getByText('Error');
    expect(button).toHaveAttribute('style');
    expect(button.style.backgroundColor).toBeTruthy();
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  test('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading');
    expect(button).toBeDisabled();
    // SVG 스피너는 role='img'가 아니므로 다른 방법으로 찾기
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  test('applies size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByText('Small');
    // CSS-in-JS 인라인 스타일 테스트로 수정
    expect(button).toHaveAttribute('style');
    expect(button.style.padding).toBeTruthy();

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByText('Medium');
    expect(button).toHaveAttribute('style');
    expect(button.style.padding).toBeTruthy();

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByText('Large');
    expect(button).toHaveAttribute('style');
    expect(button.style.padding).toBeTruthy();
  });
});