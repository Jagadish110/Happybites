import { Route, Routes } from 'react-router-dom'
import BackgroundDecor from './components/BackgroundDecor.jsx'
import { MenuProvider } from './store/MenuStore.jsx'
import ParentLayout from './components/ParentLayout.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import CounterPage from './pages/CounterPage.jsx'
import Children from './pages/parent/Children.jsx'
import ChildDetail from './pages/parent/ChildDetail.jsx'
import TopUp from './pages/parent/TopUp.jsx'
import Limits from './pages/parent/Limits.jsx'
import Activity from './pages/parent/Activity.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Items from './pages/admin/Items.jsx'
import Offers from './pages/admin/Offers.jsx'

/**
 * Three separate sides, no shared session:
 *   /        canteen counter — staff build an order and charge the card
 *   /parent  parent portal   — card secret code is the login
 *   /admin   admin portal    — menu, offers, today's numbers
 */
export default function App() {
  return (
    <MenuProvider>
      <div className="app">
        <BackgroundDecor />

        <Routes>
          <Route path="/" element={<CounterPage />} />

          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<Children />} />
            <Route path="activity" element={<Activity />} />
            <Route path=":id" element={<ChildDetail />} />
            <Route path=":id/topup" element={<TopUp />} />
            <Route path=":id/limits" element={<Limits />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="items" element={<Items />} />
            <Route path="offers" element={<Offers />} />
          </Route>

          <Route path="*" element={
            <div className="page"><p className="empty">That page does not exist.</p></div>
          } />
        </Routes>
      </div>
    </MenuProvider>
  )
}
