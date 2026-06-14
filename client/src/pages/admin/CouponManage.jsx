import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { couponApi } from '../../services/api.js';

function CouponManage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'discount',
    value: 10,
    threshold: 0,
    unit: '元',
    totalCount: 1000,
    expireDays: 30,
    description: '',
    style: {
      bgColor: '#ff6b6b',
      textColor: '#ffffff',
      borderColor: '#ee5a5a'
    }
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const result = await couponApi.getCoupons();
      if (result.code === 0) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        threshold: coupon.threshold,
        unit: coupon.unit,
        totalCount: coupon.totalCount,
        expireDays: coupon.expireDays,
        description: coupon.description,
        style: coupon.style || {
          bgColor: '#ff6b6b',
          textColor: '#ffffff',
          borderColor: '#ee5a5a'
        }
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        name: '',
        type: 'discount',
        value: 10,
        threshold: 0,
        unit: '元',
        totalCount: 1000,
        expireDays: 30,
        description: '',
        style: {
          bgColor: '#ff6b6b',
          textColor: '#ffffff',
          borderColor: '#ee5a5a'
        }
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      let result;
      if (editingCoupon) {
        result = await couponApi.updateCoupon(editingCoupon.id, formData);
      } else {
        result = await couponApi.createCoupon(formData);
      }

      if (result.code === 0) {
        setMessage({ type: 'success', text: editingCoupon ? '优惠券更新成功' : '优惠券创建成功' });
        setShowModal(false);
        loadCoupons();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失败，请重试' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个优惠券吗？')) return;
    
    try {
      const result = await couponApi.deleteCoupon(id);
      if (result.code === 0) {
        loadCoupons();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const getCouponTypeLabel = (type) => {
    const types = { discount: '满减券', shipping: '免邮券', cash: '现金券' };
    return types[type] || '优惠券';
  };

  const colorPresets = [
    { bg: '#ff6b6b', border: '#ee5a5a', name: '红色' },
    { bg: '#4ecdc4', border: '#3dbdb5', name: '青色' },
    { bg: '#667eea', border: '#556dd9', name: '紫色' },
    { bg: '#f093fb', border: '#e083eb', name: '粉色' },
    { bg: '#fa8c16', border: '#d46b08', name: '橙色' },
    { bg: '#52c41a', border: '#389e0d', name: '绿色' }
  ];

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="coupon-manage">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>优惠券管理</h1>
          <p className="page-desc">配置券面样式、发放总量、领取限制</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin" className="btn btn-secondary">返回概览</Link>
          <Link to="/admin/activities" className="btn btn-secondary">活动管理</Link>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ 新建优惠券</button>
        </div>
      </div>

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

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>优惠券</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>类型</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>发放总量</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>已领取</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>已使用</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>有效期</th>
              <th style={{ textAlign: 'right', padding: '12px', fontSize: '13px', color: '#666' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => {
              const remaining = coupon.totalCount - coupon.claimedCount;
              const claimRate = coupon.totalCount > 0 ? ((coupon.claimedCount / coupon.totalCount) * 100).toFixed(1) : 0;
              
              return (
                <tr key={coupon.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '6px',
                        background: coupon.style?.bgColor || '#ff6b6b',
                        color: coupon.style?.textColor || 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {coupon.type === 'shipping' ? '免邮' : `${coupon.value}${coupon.unit}`}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{coupon.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{coupon.description}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="tag" style={{
                      background: '#f0f5ff',
                      color: '#667eea',
                      border: '1px solid #adc6ff'
                    }}>
                      {getCouponTypeLabel(coupon.type)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{coupon.totalCount}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '80px',
                        height: '6px',
                        background: '#f0f0f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: coupon.style?.bgColor || '#ff6b6b',
                          width: `${claimRate}%`
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>{claimRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#52c41a' }}>{coupon.usedCount}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {coupon.expireDays} 天
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-sm btn-secondary" 
                      style={{ marginRight: '8px' }}
                      onClick={() => handleOpenModal(coupon)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(coupon.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <p>暂无优惠券，点击右上角新建</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCoupon ? '编辑优惠券' : '新建优惠券'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div className="form-group">
                    <label className="form-label">优惠券名称</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入优惠券名称"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">优惠券类型</label>
                    <select 
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="discount">满减券</option>
                      <option value="shipping">免邮券</option>
                      <option value="cash">现金券</option>
                    </select>
                  </div>

                  {formData.type !== 'shipping' && (
                    <>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">面值</label>
                          <input 
                            type="number" 
                            className="form-input"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">单位</label>
                          <input 
                            type="text" 
                            className="form-input"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">使用门槛（最低消费）</label>
                        <input 
                          type="number" 
                          className="form-input"
                          value={formData.threshold}
                          onChange={e => setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div className="form-group">
                    <label className="form-label">发放总量</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={formData.totalCount}
                      onChange={e => setFormData({ ...formData, totalCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">有效期（天）</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={formData.expireDays}
                      onChange={e => setFormData({ ...formData, expireDays: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">券面颜色</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {colorPresets.map((color, i) => (
                        <div
                          key={i}
                          onClick={() => setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              bgColor: color.bg,
                              borderColor: color.border
                            }
                          })}
                          title={color.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: color.bg,
                            cursor: 'pointer',
                            border: formData.style?.bgColor === color.bg ? '2px solid #333' : '2px solid transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">使用说明</label>
                <textarea 
                  className="form-textarea"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入优惠券使用说明"
                />
              </div>

              <div style={{ 
                padding: '16px', 
                background: '#f9f9f9', 
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>预览效果</div>
                <div style={{
                  display: 'flex',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `1px solid ${formData.style?.borderColor || '#e0e0e0'}`,
                  background: 'white',
                  maxWidth: '300px'
                }}>
                  <div style={{
                    background: formData.style?.bgColor || '#ff6b6b',
                    color: formData.style?.textColor || 'white',
                    padding: '16px 12px',
                    textAlign: 'center',
                    minWidth: '100px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {formData.type === 'shipping' ? '免邮' : `${formData.value}${formData.unit}`}
                    </div>
                    {formData.threshold > 0 && (
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        满{formData.threshold}元可用
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px', flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {formData.name || '优惠券名称'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {formData.description || '使用说明'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingCoupon ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponManage;
