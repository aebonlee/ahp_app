import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AHP for Paper title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/AHP for Paper/i);
  expect(titleElements[0]).toBeInTheDocument();
});

test('renders system description', () => {
  render(<App />);
  const descriptionElements = screen.getAllByText(/과학적 의사결정을 위한 계층적 분석 플랫폼/i);
  expect(descriptionElements[0]).toBeInTheDocument();
});
