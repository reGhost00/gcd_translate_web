import { render, screen } from '@testing-library/react';
import Root from './root';

test('renders learn react link', () => {
  render(<Root />);
  const linkElement = screen.getByText(/web 前端/i);
  expect(linkElement).toBeInTheDocument();
});
