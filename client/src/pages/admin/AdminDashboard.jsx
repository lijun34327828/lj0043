import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../../services/api.js';

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [claimRateData, setClaimRateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, rateRes] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getClaimRate(24)
      ]);
      
      if (overviewRes.code === 0) {
        setOverview(overviewRes.data);
      }
      if (rateRes.code === 0) {
        setClaimRateData(rateRes.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...claimRateData.map(d => d.count), 1);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const statCards = [
    { label: '活动总数', value: overview?.totalActivities || 0, color: '#667eea', icon: '📅' },
    { label: '进行中活动', value: overview?.activeActivities || 0, color: '#52c41a', icon: '✅' },
    { label: '累计发放', value: overview?.totalClaimed || 0, color: '#fa8c16', icon: '🎫' },
    { label: '累计使用', value: overview?.totalUsed || 0, color: '#1890ff', icon: '📊' }
  ];

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>管理后台</h1>
          <p className="page-desc">数据概览与运营监控</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/activities" className="btn btn-secondary">活动管理</Link>
          <Link to="/admin/coupons" className="btn btn-secondary">优惠券管理</Link>
        </div>
      </div>

      <div className="stat-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>24小时领取趋势</h3>
          <div className="chart-container" style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {claimRateData.map((item, index) => (
              <div key={index} className="chart-bar" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '4px 4px 0 0',
                  height: `${(item.count / maxCount) * 180}px`,
                  minHeight: item.count > 0 ? '4px' : '0',
                  transition: 'height 0.3s'
                }} title={`${item.count} 张`} />
                <span style={{ fontSize: '10px', color: '#999' }}>{item.hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>数据指标</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="metric-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>领取率</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {overview?.claimRate || 0}%
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #fa8c16, #ffa940)',
                  width: `${overview?.claimRate || 0}%`,
                  borderRadius: '4px',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div className="metric-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>使用率</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#52c41a' }}>
                  {overview?.usageRate || 0}%
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #52c41a, #95de64)',
                  width: `${overview?.usageRate || 0}%`,
                  borderRadius: '4px',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: '#f6ffed',
              borderRadius: '6px',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#52c41a', marginBottom: '4px' }}>券池总量</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                {overview?.totalCoupons || 0} 张
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
