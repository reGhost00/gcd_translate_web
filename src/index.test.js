import { render, screen } from '@testing-library/react';
import Root from './root';

test('renders learn react link', () => {
  render(<Root />);
  const linkElement = screen.getByText(/文件传输WEB/i);
  expect(linkElement).toBeInTheDocument();
});
