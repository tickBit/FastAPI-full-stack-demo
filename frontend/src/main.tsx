import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import App from './App'
import Login from './components/Login'
import Register from './components/Register'
import Upload from './components/Upload'
import { AuthProvider } from './contexts/AuthContext';
import { ImageProvider } from './contexts/ImageContext';

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
  },
  {
    path: "/upload",
    element: <Upload />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ImageProvider>
        <RouterProvider router={router} />
      </ImageProvider>
    </AuthProvider>
  </StrictMode>,
)
