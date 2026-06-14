const express = require('express');
const router = express.Router();
const { loadData } = require('../dataStore');

router.get('/overview', (req, res) => {
  const data = loadData();
  
  const totalCoupons = data.coupons.reduce((sum, c) => sum + c.totalCount, 0);
  const totalClaimed = data.coupons.reduce((sum, c) => sum + c.claimedCount, 0);
  const totalUsed = data.coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const activeActivities = data.activities.filter(a => a.status === 'active').length;
  
  const claimRate = totalCoupons > 0 ? ((totalClaimed / totalCoupons) * 100).toFixed(2) : 0;
  const usageRate = totalClaimed > 0 ? ((totalUsed / totalClaimed) * 100).toFixed(2) : 0;
  
  res.json({
    code: 0,
    data: {
      totalActivities: data.activities.length,
      activeActivities,
      totalCoupons,
      totalClaimed,
      totalUsed,
      claimRate: parseFloat(claimRate),
      usageRate: parseFloat(usageRate)
    }
  });
});

router.get('/activities', (req, res) => {
  const data = loadData();
  
  const activityStats = data.activities.map(activity => {
    const coupons = data.coupons.filter(c => activity.couponIds.includes(c.id));
    const totalCount = coupons.reduce((sum, c) => sum + c.totalCount, 0);
    const claimedCount = coupons.reduce((sum, c) => sum + c.claimedCount, 0);
    const usedCount = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    
    return {
      id: activity.id,
      name: activity.name,
      status: activity.status,
      totalCount,
      claimedCount,
      usedCount,
      remainingCount: totalCount - claimedCount,
      claimRate: totalCount > 0 ? ((claimedCount / totalCount) * 100).toFixed(2) : 0
    };
  });
  
  res.json({ code: 0, data: activityStats });
});

router.get('/claim-rate', (req, res) => {
  const data = loadData();
  const { hours = 24 } = req.query;
  
  const now = Date.now();
  const startTime = now - hours * 60 * 60 * 1000;
  
  const recentRecords = data.claimRecords.filter(r => r.claimedAt >= startTime);
  
  const hourlyData = {};
  for (let i = 0; i < hours; i++) {
    const hourTime = new Date(now - (hours - 1 - i) * 60 * 60 * 1000);
    const hourKey = hourTime.toISOString().slice(0, 13);
    const displayHour = `${hourTime.getHours()}:00`;
    hourlyData[hourKey] = { hour: displayHour, count: 0 };
  }
  
  recentRecords.forEach(record => {
    const hourKey = new Date(record.claimedAt).toISOString().slice(0, 13);
    if (hourlyData[hourKey]) {
      hourlyData[hourKey].count++;
    }
  });
  
  const result = Object.values(hourlyData);
  
  res.json({ code: 0, data: result });
});

router.get('/coupon-stats', (req, res) => {
  const data = loadData();
  
  const couponStats = data.coupons.map(coupon => {
    const remaining = coupon.totalCount - coupon.claimedCount;
    return {
      id: coupon.id,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      threshold: coupon.threshold,
      totalCount: coupon.totalCount,
      claimedCount: coupon.claimedCount,
      usedCount: coupon.usedCount,
      remainingCount: remaining,
      claimRate: coupon.totalCount > 0 ? ((coupon.claimedCount / coupon.totalCount) * 100).toFixed(2) : 0,
      usageRate: coupon.claimedCount > 0 ? ((coupon.usedCount / coupon.claimedCount) * 100).toFixed(2) : 0
    };
  });
  
  res.json({ code: 0, data: couponStats });
});

module.exports = router;
