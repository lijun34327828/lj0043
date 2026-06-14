import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityApi, couponApi } from '../../services/api.js';

function ActivityManage() {
  const [activities, setActivities] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    bannerColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    couponIds: [],
    claimLimit: 1
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [actRes, cpnRes] = await Promise.all([
        activityApi.getActivities(),
        couponApi.getCoupons()
      ]);
      
      if (actRes.code === 0) setActivities(actRes.data);
      if (cpnRes.code === 0) setCoupons(cpnRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        name: activity.name,
        description: activity.description,
        startTime: new Date(activity.startTime).toISOString().slice(0, 16),
        endTime: new Date(activity.endTime).toISOString().slice(0, 16),
        bannerColor: activity.bannerColor,
        couponIds: activity.couponIds || [],
        claimLimit: activity.claimLimit
      });
    } else {
      setEditingActivity(null);
      setFormData({
        name: '',
        description: '',
        startTime: '',
        endTime: '',
        bannerColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        couponIds: [],
        claimLimit: 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).getTime() : Date.now(),
        endTime: formData.endTime ? new Date(formData.endTime).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000
      };

      let result;
      if (editingActivity) {
        result = await activityApi.updateActivity(editingActivity.id, data);
      } else {
        result = await activityApi.createActivity(data);
      }

      if (result.code === 0) {
        setMessage({ type: 'success', text: editingActivity ? '活动更新成功' : '活动创建成功' });
        setShowModal(false);
        loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失败，请重试' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleStatus = async (activity) => {
    try {
      let result;
      if (activity.status === 'active') {
        result = await activityApi.stopActivity(activity.id);
      } else {
        result = await activityApi.startActivity(activity.id);
      }
      
      if (result.code === 0) {
        loadData();
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个活动吗？')) return;
    
    try {
      const result = await activityApi.deleteActivity(id);
      if (result.code === 0) {
        loadData();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleCouponChange = (couponId) => {
    setFormData(prev => {
      const ids = prev.couponIds.includes(couponId)
        ? prev.couponIds.filter(id => id !== couponId)
        : [...prev.couponIds, couponId];
      return { ...prev, couponIds: ids };
    });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const colorOptions = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  ];

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="activity-manage">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>活动管理</h1>
          <p className="page-desc">创建和管理营销活动</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin" className="btn btn-secondary">返回概览</Link>
          <Link to="/admin/coupons" className="btn btn-secondary">优惠券管理</Link>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ 新建活动</button>
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
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>活动名称</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>状态</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>优惠券</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>有效期</th>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#666' }}>领取限制</th>
              <th style={{ textAlign: 'right', padding: '12px', fontSize: '13px', color: '#666' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity => (
              <tr key={activity.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: activity.bannerColor
                    }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>{activity.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{activity.description}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`tag tag-${activity.status}`}>
                    {activity.status === 'active' ? '进行中' : '已停止'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {activity.couponIds?.length || 0} 张券
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                  {formatDateTime(activity.startTime)}
                  <br />
                  ~ {formatDateTime(activity.endTime)}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                  每人 {activity.claimLimit} 次
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button 
                    className={`btn btn-sm ${activity.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                    style={{ marginRight: '8px' }}
                    onClick={() => handleToggleStatus(activity)}
                  >
                    {activity.status === 'active' ? '停止' : '启动'}
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    style={{ marginRight: '8px' }}
                    onClick={() => handleOpenModal(activity)}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(activity.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activities.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>暂无活动，点击右上角新建</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingActivity ? '编辑活动' : '新建活动'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">活动名称</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入活动名称"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">活动描述</label>
                <textarea 
                  className="form-textarea"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入活动描述"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">开始时间</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">结束时间</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">领取限制（每人次数）</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={formData.claimLimit}
                  onChange={e => setFormData({ ...formData, claimLimit: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">横幅样式</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      onClick={() => setFormData({ ...formData, bannerColor: color })}
                      style={{
                        width: '48px',
                        height: '32px',
                        borderRadius: '6px',
                        background: color,
                        cursor: 'pointer',
                        border: formData.bannerColor === color ? '2px solid #333' : '2px solid transparent',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">关联优惠券</label>
                <div style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '6px', 
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {coupons.map(coupon => (
                    <label key={coupon.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 0',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f5f5f5'
                    }}>
                      <input 
                        type="checkbox"
                        checked={formData.couponIds.includes(coupon.id)}
                        onChange={() => handleCouponChange(coupon.id)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{coupon.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {coupon.type === 'discount' ? `满${coupon.threshold}减${coupon.value}` : '免邮券'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        剩余 {coupon.totalCount - coupon.claimedCount} 张
                      </div>
                    </label>
                  ))}
                  {coupons.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      暂无优惠券，请先创建优惠券
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingActivity ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityManage;
