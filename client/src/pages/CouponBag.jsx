import React, { useState, useEffect } from 'react';
import { couponApi } from '../services/api.js';

const USER_ID = 'user-001';

function CouponBag() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, [activeTab]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? null : activeTab;
      const result = await couponApi.getUserCoupons(USER_ID, status);
      if (result.code === 0) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCoupon = async (userCouponId) => {
    try {
      const result = await couponApi.useCoupon(userCouponId, USER_ID);
      if (result.code === 0) {
        setMessage({ type: 'success', text: '优惠券使用成功！' });
        loadCoupons();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '使用失败，请重试' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysRemaining = (expireAt) => {
    const diff = expireAt - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const tabs = [
    { key: 'all', label: '全部', count: coupons.length },
    { key: 'unused', label: '未使用', count: coupons.filter(c => c.status === 'unused').length },
    { key: 'used', label: '已使用', count: coupons.filter(c => c.status === 'used').length },
    { key: 'expired', label: '已过期', count: coupons.filter(c => c.status === 'expired').length }
  ];

  const getCouponTypeLabel = (type) => {
    const types = { discount: '满减券', shipping: '免邮券', cash: '现金券' };
    return types[type] || '优惠券';
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="coupon-bag">
      <h1 className="page-title">我的卡包</h1>
      <p className="page-desc">查看已领取的优惠券，管理您的优惠权益</p>

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

      <div className="tabs" style={{
        display: 'flex',
        background: 'white',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '20px',
        gap: '4px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: activeTab === tab.key ? 'white' : '#666',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
            <span style={{ marginLeft: '6px', opacity: 0.8 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="coupon-list" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '16px'
      }}>
        {coupons.map(uc => {
          const coupon = uc.coupon || {};
          const style = coupon.style || {};
          const isDisabled = uc.status === 'used' || uc.status === 'expired';
          
          return (
            <div 
              key={uc.id} 
              className={`coupon-item coupon-${uc.status}`}
              style={{
                display: 'flex',
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                position: 'relative',
                opacity: isDisabled ? 0.65 : 1
              }}
            >
              <div 
                className="coupon-amount"
                style={{
                  background: style.bgColor || '#ff6b6b',
                  color: style.textColor || 'white',
                  padding: '20px 16px',
                  minWidth: '120px',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {coupon.type === 'shipping' ? '免邮' : `${coupon.value}${coupon.unit || '元'}`}
                </div>
                {coupon.threshold > 0 && (
                  <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                    满{coupon.threshold}元可用
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-6px',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  background: '#f5f7fa',
                  borderRadius: '50%'
                }} />
              </div>
              
              <div className="coupon-info" style={{ padding: '16px', flex: 1 }}>
                <div className="coupon-name" style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '6px'
                }}>
                  {coupon.name}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  {getCouponTypeLabel(coupon.type)}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  有效期至: {formatDate(uc.expireAt)}
                </div>
                
                {uc.status === 'unused' && (
                  <div style={{ fontSize: '12px', color: '#fa8c16' }}>
                    还剩 {getDaysRemaining(uc.expireAt)} 天过期
                  </div>
                )}
                
                {uc.status === 'used' && (
                  <div style={{ fontSize: '12px', color: '#52c41a' }}>
                    使用时间: {formatDate(uc.usedAt)}
                  </div>
                )}
                
                {uc.status === 'expired' && (
                  <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                    已过期
                  </div>
                )}

                {uc.status === 'unused' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUseCoupon(uc.id)}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    立即使用
                  </button>
                )}
              </div>

              {(uc.status === 'used' || uc.status === 'expired') && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%) rotate(15deg)',
                  fontSize: '24px',
                  color: '#ccc',
                  fontWeight: 'bold',
                  opacity: 0.5,
                  border: '2px solid #ccc',
                  padding: '4px 16px',
                  borderRadius: '4px'
                }}>
                  {uc.status === 'used' ? '已使用' : '已过期'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {coupons.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <p>暂无优惠券</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>去活动专区领取更多优惠券吧</p>
        </div>
      )}
    </div>
  );
}

export default CouponBag;
