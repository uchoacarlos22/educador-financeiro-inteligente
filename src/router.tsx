import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './components/layout/RootLayout'
import { SimulationFormPage } from './pages/SimulationFormPages'
import { SimulationHistoryPage } from './pages/SimulationHistoryPage'
import { SimulationResultsPage } from './pages/SimulationResultsPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SimulationFormPage />,
      },
      {
        path: '/historico',
        element: <SimulationHistoryPage />,
      },
      {
        path: '/resultado/:id',
        element: <SimulationResultsPage />,
      },
    ],
  },
])
