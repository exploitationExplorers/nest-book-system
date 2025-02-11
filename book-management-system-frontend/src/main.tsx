import { createRoot } from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import './index.css'
import {Login} from './pages/Login'
import {Register} from './pages/Register'
import {BookManage} from './pages/BookManage'

const routes = [
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },
  {
    path: "/",
    element: <BookManage/>,
  },
];

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(

    <RouterProvider router={router} />

)
