import './App.css';
import NavBar from './components/NavBar';

function App() {
  return (
    <div className="app">
      
      <NavBar />

      <main className="home">
        <h1>☁ The Polkadot Cloud</h1>

        <p>
          Welcome to The Polkadot Cloud — a platform for software development,
          resume tools, open source systems, and cloud-based applications.
        </p>

        <section className="card-grid">

          <div className="card">
            <h2>Resume Generator</h2>
            <p>Build structured resumes in Action → Result → Impact format.</p>
          </div>

          <div className="card">
            <h2>Projects</h2>
            <p>Open source tools, experiments, and cloud applications.</p>
          </div>

          <div className="card">
            <h2>About</h2>
            <p>Long-term platform for education + cloud systems.</p>
          </div>

          <div className="card">
            <h2>Contact</h2>
            <p>Professional profile and contact hub.</p>
          </div>
     
          <div class Name="card">
             <h2>Twitter Classic</h2>
             <p>It'll always be Twitter.</p>
          </div> 

        </section>
      </main>

    </div>
  );
}

export default App;
