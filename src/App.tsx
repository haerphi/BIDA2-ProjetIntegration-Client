import { useRoutes } from 'react-router-dom';
import appRoutes from './pages/app.routes';

function App() {
  const routes = useRoutes(appRoutes);

  return <>{routes}</>;
}

export default App;
