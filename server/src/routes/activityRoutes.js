const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadData, saveData } = require('../dataStore');

router.get('/', (req, res) => {
  const data = loadData();
  const { status } = req.query;
  let activities = data.activities;
  
  if (status) {
    activities = activities.filter(a => a.status === status);
  }
  
  const result = activities.map(activity => {
    const coupons = data.coupons.filter(c => activity.couponIds.includes(c.id));
    return {
      ...activity,
      coupons,
      remainingCount: Math.min(...coupons.map(c => c.totalCount - c.claimedCount))
    };
  });
  
  res.json({ code: 0, data: result });
});

router.get('/:id', (req, res) => {
  const data = loadData();
  const activity = data.activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  const coupons = data.coupons.filter(c => activity.couponIds.includes(c.id));
  
  res.json({ 
    code: 0, 
    data: { 
      ...activity, 
      coupons,
      remainingCount: Math.min(...coupons.map(c => c.totalCount - c.claimedCount))
    } 
  });
});

router.post('/', (req, res) => {
  const data = loadData();
  const { name, description, startTime, endTime, bannerColor, couponIds, claimLimit } = req.body;
  
  const newActivity = {
    id: uuidv4(),
    name,
    description,
    status: 'inactive',
    startTime: startTime || Date.now(),
    endTime: endTime || Date.now() + 7 * 24 * 60 * 60 * 1000,
    bannerColor: bannerColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    couponIds: couponIds || [],
    claimLimit: claimLimit || 1,
    createdAt: Date.now()
  };
  
  data.activities.push(newActivity);
  saveData(data);
  
  res.json({ code: 0, data: newActivity, message: '活动创建成功' });
});

router.put('/:id', (req, res) => {
  const data = loadData();
  const index = data.activities.findIndex(a => a.id === req.params.id);
  
  if (index === -1) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  data.activities[index] = {
    ...data.activities[index],
    ...req.body,
    id: data.activities[index].id,
    createdAt: data.activities[index].createdAt
  };
  
  saveData(data);
  
  res.json({ code: 0, data: data.activities[index], message: '活动更新成功' });
});

router.post('/:id/start', (req, res) => {
  const data = loadData();
  const activity = data.activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  if (activity.couponIds.length === 0) {
    return res.json({ code: 1, message: '请先配置活动优惠券' });
  }
  
  activity.status = 'active';
  saveData(data);
  
  res.json({ code: 0, data: activity, message: '活动已启动' });
});

router.post('/:id/stop', (req, res) => {
  const data = loadData();
  const activity = data.activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  activity.status = 'inactive';
  saveData(data);
  
  res.json({ code: 0, data: activity, message: '活动已停止' });
});

router.delete('/:id', (req, res) => {
  const data = loadData();
  const index = data.activities.findIndex(a => a.id === req.params.id);
  
  if (index === -1) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  data.activities.splice(index, 1);
  saveData(data);
  
  res.json({ code: 0, message: '活动删除成功' });
});

module.exports = router;
