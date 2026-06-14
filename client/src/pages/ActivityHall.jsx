import React, { useState, useEffect } from 'react';
import { activityApi } from '../services/api.js';
import CouponCard from '../components/CouponCard.jsx';

const USER_ID = 'user-001';

function ActivityHall() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const result = await activityApi.getActivities();
      if (result.code === 0) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (activityId) => {
    try {
      setClaimingId(activityId);
      const result = await activityApi.claimActivity(activityId, USER_ID);
      if (result.code === 0) {
        setMessage({ type: 'success', text: `成功领取 ${result.data.length} 张优惠券！` });
        loadActivities();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '领取失败，请重试' });
    } finally {
      setClaimingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getTimeRemaining = (endTime) => {
    const now = Date.now();
    const diff = endTime - now;
    if (diff <= 0) return '已结束';
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `剩 ${days} 天`;
    return `剩 ${hours} 小时`;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="activity-hall">
      <h1 className="page-title">活动专区</h1>
      <p className="page-desc">精选限时活动，超值优惠券等你来领</p>

      {message && (
        <div className={`message message-${message.type}`} style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          background: message.type === 'success' ? '#f6ffed' : '#fff1f0',
          color: message.type === 'success' ? '#52c41a' : '#ff4d4f',
          border: `1px solid ${message.type === 'success' ? '#b7eb8f' : '#ffa39e'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="activity-list">
        {activities.filter(a => a.status === 'active').map(activity => (
          <div key={activity.id} className="activity-card" style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="activity-banner" style={{
              background: activity.bannerColor,
              padding: '24px',
              color: 'white',
              position: 'relative'
            }}>
              <h2 className="activity-name" style={{ fontSize: '22px', marginBottom: '8px' }}>
                {activity.name}
              </h2>
              <p className="activity-desc" style={{ opacity: 0.9, fontSize: '14px', marginBottom: '12px' }}>
                {activity.description}
              </p>
              <div className="activity-meta" style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.9 }}>
                <span>有效期: {formatTime(activity.startTime)} ~ {formatTime(activity.endTime)}</span>
                <span>{getTimeRemaining(activity.endTime)}</span>
              </div>
              <div className="activity-tag" style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.25)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px'
              }}>
                {activity.status === 'active' ? '进行中' : '未开始'}
              </div>
            </div>
            
            <div className="activity-coupons" style={{ padding: '20px' }}>
              <div className="coupon-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {activity.coupons?.map(coupon => (
                  <CouponCard key={coupon.id} coupon={coupon} showRemaining />
                ))}
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => handleClaim(activity.id)}
                  disabled={claimingId === activity.id}
                  style={{
                    padding: '12px 48px',
                    fontSize: '16px',
                    borderRadius: '8px'
                  }}
                >
                  {claimingId === activity.id ? '领取中...' : '一键领取券包'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.filter(a => a.status === 'active').length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <p>暂无进行中的活动，敬请期待</p>
        </div>
      )}
    </div>
  );
}

export default ActivityHall;
