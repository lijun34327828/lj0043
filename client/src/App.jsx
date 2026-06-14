import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import ActivityHall from './pages/ActivityHall.jsx';
import CouponBag from './pages/CouponBag.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ActivityManage from './pages/admin/ActivityManage.jsx';
import CouponManage from './pages/admin/CouponManage.jsx';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="logo">🎫</span>
            <span className="brand-name">活动专区</span>
          </div>
          <div className="nav-menu">
            <NavLink to="/" className="nav-link" end>活动大厅</NavLink>
            <NavLink to="/coupon-bag" className="nav-link">我的卡包</NavLink>
            <NavLink to="/admin" className="nav-link admin-link">管理后台</NavLink>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ActivityHall />} />
          <Route path="/coupon-bag" element={<CouponBag />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/activities" element={<ActivityManage />} />
          <Route path="/admin/coupons" element={<CouponManage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
