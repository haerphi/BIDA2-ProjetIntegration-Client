import { useRoutes } from 'react-router-dom';
import './App.css';
import NavBar from './layout/nav-bar/nav-bar';
import appRoutes from './pages/app.routes';

function App() {
  const routes = useRoutes(appRoutes);

  return (
    <>
      <NavBar />
      <main>{routes}</main>
    </>
  );
}

export default App;
