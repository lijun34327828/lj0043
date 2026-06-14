import React from 'react';

function CouponCard({ coupon, showRemaining = false, status = 'unused', onUse }) {
  const getCouponTypeLabel = (type) => {
    const types = {
      discount: '满减券',
      shipping: '免邮券',
      cash: '现金券'
    };
    return types[type] || '优惠券';
  };

  const formatValue = () => {
    if (coupon.type === 'shipping') {
      return '免邮';
    }
    return `${coupon.value}${coupon.unit || '元'}`;
  };

  const getRemainingPercent = () => {
    if (!coupon.totalCount) return 100;
    const remaining = coupon.totalCount - (coupon.claimedCount || 0);
    return (remaining / coupon.totalCount) * 100;
  };

  const isDisabled = status === 'used' || status === 'expired';
  const style = coupon.style || {};

  return (
    <div 
      className={`coupon-card coupon-${status}`}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white',
        border: `1px solid ${style.borderColor || '#e0e0e0'}`,
        opacity: isDisabled ? 0.6 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
    >
      <div 
        className="coupon-left"
        style={{
          background: style.bgColor || '#ff6b6b',
          color: style.textColor || 'white',
          padding: '20px 16px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="coupon-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>
          {formatValue()}
        </div>
        {coupon.threshold > 0 && (
          <div className="coupon-threshold" style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
            满{coupon.threshold}元可用
          </div>
        )}
        <div className="coupon-type" style={{
          fontSize: '12px',
          marginTop: '8px',
          padding: '2px 8px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '10px',
          display: 'inline-block'
        }}>
          {getCouponTypeLabel(coupon.type)}
        </div>
      </div>
      
      <div className="coupon-right" style={{ padding: '16px', flex: 1 }}>
        <div className="coupon-name" style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#333'
        }}>
          {coupon.name}
        </div>
        <div className="coupon-desc" style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '12px',
          minHeight: '32px'
        }}>
          {coupon.description}
        </div>
        
        {showRemaining && (
          <div className="coupon-remaining">
            <div className="remaining-bar" style={{
              height: '6px',
              background: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '6px'
            }}>
              <div 
                className="remaining-fill"
                style={{
                  height: '100%',
                  background: style.bgColor || '#ff6b6b',
                  width: `${getRemainingPercent()}%`,
                  borderRadius: '3px'
                }}
              />
            </div>
            <div className="remaining-text" style={{
              fontSize: '11px',
              color: '#999',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>剩余 {coupon.totalCount - coupon.claimedCount} 张</span>
              <span>已领 {coupon.claimedCount}</span>
            </div>
          </div>
        )}

        {status === 'used' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#ccc',
            fontWeight: 'bold',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 2
          }}>
            已使用
          </div>
        )}

        {status === 'expired' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#ccc',
            fontWeight: 'bold',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 2
          }}>
            已过期
          </div>
        )}

        {onUse && status === 'unused' && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={onUse}
            style={{ marginTop: '12px', width: '100%' }}
          >
            立即使用
          </button>
        )}
      </div>
    </div>
  );
}

export default CouponCard;
