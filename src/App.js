import logo from './logo.svg';
import './App.css';
import { ResizeParent } from "./resizePanel";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <ResizeParent className='cter'>
        <div className='panel p1'>p1</div>
        <div className='panel p2'>p2</div>
        <div className='panel p3'>p3</div>
      </ResizeParent>
    </div>
  );
}

export default App;
