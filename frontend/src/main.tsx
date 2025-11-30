import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import App from './App'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './contexts/AuthContext';

const router = createBrowserRouter([{
    path: "/",
    element: <App />,
    errorElement: <div>404 Not Found</div>
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
