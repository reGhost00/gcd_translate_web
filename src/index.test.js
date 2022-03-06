import { render, screen } from '@testing-library/react';
import Root from './root';

test('renders learn react link', () => {
  render(<Root />);
<<<<<<< HEAD:src/root.test.js
  const linkElement = screen.getByText(/文件传输web/i);
=======
  const linkElement = screen.getByText(/web 前端/i);
>>>>>>> c8d413bcc91e9a8a5bb7e7a5e2083415d4f58e3a:src/index.test.js
  expect(linkElement).toBeInTheDocument();
});
