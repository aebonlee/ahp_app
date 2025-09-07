import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

const mockOnLogin = jest.fn();
const mockOnRegister = jest.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    mockOnLogin.mockClear();
    mockOnRegister.mockClear();
  });

  it('renders login mode selection initially', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByText('AHP for Paper')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
    expect(screen.getByText('서비스 이용')).toBeInTheDocument();
  });

  it('switches to service login mode when service login button is clicked', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('switches to admin login mode when admin login button is clicked', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    fireEvent.click(screen.getByText('서비스 로그인'));
    
    const loginButton = screen.getByRole('button', { name: /로그인/ });
    fireEvent.click(loginButton);
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('displays loading state', () => {
    render(<LoginForm onLogin={mockOnLogin} loading={true} />);
    
    expect(screen.getByText('AHP for Paper')).toBeInTheDocument();
  });

  it('displays error message', async () => {
    const errorMessage = 'Login failed';
    render(<LoginForm onLogin={mockOnLogin} error={errorMessage} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows register option when onRegister is provided', async () => {
    render(<LoginForm onLogin={mockOnLogin} onRegister={mockOnRegister} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    
    expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument();
    expect(screen.getByText('회원가입하기 →')).toBeInTheDocument();
  });

  it('calls onRegister when register link is clicked', async () => {
    render(<LoginForm onLogin={mockOnLogin} onRegister={mockOnRegister} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    await userEvent.click(screen.getByText('회원가입하기 →'));
    
    expect(mockOnRegister).toHaveBeenCalled();
  });

  it('allows going back to selection from login mode', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    await userEvent.click(screen.getByText('서비스 로그인'));
    await userEvent.click(screen.getByText('이전으로 돌아가기'));
    
    expect(screen.getByText('서비스 로그인')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });
});