const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadData, saveData } = require('../dataStore');

router.get('/', (req, res) => {
  const data = loadData();
  res.json({ code: 0, data: data.coupons });
});

router.get('/:id', (req, res) => {
  const data = loadData();
  const coupon = data.coupons.find(c => c.id === req.params.id);
  
  if (!coupon) {
    return res.json({ code: 1, message: '优惠券不存在' });
  }
  
  res.json({ code: 0, data: coupon });
});

router.post('/', (req, res) => {
  const data = loadData();
  const { name, type, value, threshold, unit, totalCount, expireDays, description, style } = req.body;
  
  const newCoupon = {
    id: uuidv4(),
    name: name || '新优惠券',
    type: type || 'discount',
    value: value || 10,
    threshold: threshold || 0,
    unit: unit || '元',
    totalCount: totalCount || 1000,
    claimedCount: 0,
    usedCount: 0,
    expireDays: expireDays || 30,
    description: description || '',
    style: style || {
      bgColor: '#ff6b6b',
      textColor: '#ffffff',
      borderColor: '#ee5a5a'
    }
  };
  
  data.coupons.push(newCoupon);
  saveData(data);
  
  res.json({ code: 0, data: newCoupon, message: '优惠券创建成功' });
});

router.put('/:id', (req, res) => {
  const data = loadData();
  const index = data.coupons.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.json({ code: 1, message: '优惠券不存在' });
  }
  
  data.coupons[index] = {
    ...data.coupons[index],
    ...req.body,
    id: data.coupons[index].id,
    claimedCount: data.coupons[index].claimedCount,
    usedCount: data.coupons[index].usedCount
  };
  
  saveData(data);
  
  res.json({ code: 0, data: data.coupons[index], message: '优惠券更新成功' });
});

router.delete('/:id', (req, res) => {
  const data = loadData();
  const index = data.coupons.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.json({ code: 1, message: '优惠券不存在' });
  }
  
  data.coupons.splice(index, 1);
  
  data.activities.forEach(activity => {
    activity.couponIds = activity.couponIds.filter(id => id !== req.params.id);
  });
  
  saveData(data);
  
  res.json({ code: 0, message: '优惠券删除成功' });
});

router.post('/claim/:activityId', (req, res) => {
  const data = loadData();
  const { userId } = req.body;
  const activityId = req.params.activityId;
  
  const activity = data.activities.find(a => a.id === activityId);
  
  if (!activity) {
    return res.json({ code: 1, message: '活动不存在' });
  }
  
  if (activity.status !== 'active') {
    return res.json({ code: 1, message: '活动未开始或已结束' });
  }
  
  const now = Date.now();
  if (now < activity.startTime || now > activity.endTime) {
    return res.json({ code: 1, message: '不在活动有效期内' });
  }
  
  const userClaimCount = data.userCoupons.filter(
    uc => uc.userId === userId && uc.activityId === activityId
  ).length;
  
  if (userClaimCount >= activity.claimLimit) {
    return res.json({ code: 1, message: '您已达到领取上限' });
  }
  
  const coupons = data.coupons.filter(c => activity.couponIds.includes(c.id));
  
  for (const coupon of coupons) {
    if (coupon.claimedCount >= coupon.totalCount) {
      return res.json({ code: 1, message: `${coupon.name}已领完` });
    }
  }
  
  const claimedCoupons = [];
  
  for (const coupon of coupons) {
    coupon.claimedCount++;
    
    const userCoupon = {
      id: uuidv4(),
      userId: userId,
      couponId: coupon.id,
      activityId: activityId,
      status: 'unused',
      claimedAt: now,
      expireAt: now + coupon.expireDays * 24 * 60 * 60 * 1000,
      usedAt: null
    };
    
    data.userCoupons.push(userCoupon);
    claimedCoupons.push({ ...userCoupon, coupon });
    
    data.claimRecords.push({
      id: uuidv4(),
      userId,
      couponId: coupon.id,
      activityId,
      claimedAt: now
    });
  }
  
  data.stats.totalClaims += coupons.length;
  
  const hourKey = new Date(now).toISOString().slice(0, 13);
  const rateItem = data.stats.claimRateData.find(d => d.hour === hourKey);
  if (rateItem) {
    rateItem.count += coupons.length;
  } else {
    data.stats.claimRateData.push({ hour: hourKey, count: coupons.length });
  }
  
  saveData(data);
  
  res.json({ code: 0, data: claimedCoupons, message: '领取成功' });
});

router.get('/user/:userId', (req, res) => {
  const data = loadData();
  const { userId } = req.params;
  const { status } = req.query;
  
  let userCoupons = data.userCoupons.filter(uc => uc.userId === userId);
  
  const now = Date.now();
  userCoupons = userCoupons.map(uc => {
    if (uc.status === 'unused' && uc.expireAt < now) {
      return { ...uc, status: 'expired' };
    }
    return uc;
  });
  
  if (status) {
    userCoupons = userCoupons.filter(uc => uc.status === status);
  }
  
  const result = userCoupons.map(uc => {
    const coupon = data.coupons.find(c => c.id === uc.couponId);
    return { ...uc, coupon };
  });
  
  result.sort((a, b) => {
    const statusOrder = { unused: 0, used: 1, expired: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.claimedAt - a.claimedAt;
  });
  
  res.json({ code: 0, data: result });
});

router.post('/use/:userCouponId', (req, res) => {
  const data = loadData();
  const { userCouponId } = req.params;
  const { userId } = req.body;
  
  const userCoupon = data.userCoupons.find(uc => uc.id === userCouponId);
  
  if (!userCoupon) {
    return res.json({ code: 1, message: '优惠券不存在' });
  }
  
  if (userCoupon.userId !== userId) {
    return res.json({ code: 1, message: '无权使用该优惠券' });
  }
  
  if (userCoupon.status !== 'unused') {
    return res.json({ code: 1, message: '优惠券不可用' });
  }
  
  const now = Date.now();
  if (userCoupon.expireAt < now) {
    return res.json({ code: 1, message: '优惠券已过期' });
  }
  
  userCoupon.status = 'used';
  userCoupon.usedAt = now;
  
  const coupon = data.coupons.find(c => c.id === userCoupon.couponId);
  if (coupon) {
    coupon.usedCount++;
  }
  
  data.stats.totalUsed++;
  saveData(data);
  
  res.json({ code: 0, data: userCoupon, message: '使用成功' });
});

module.exports = router;
