import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API 请求失败:', error);
    return Promise.reject(error);
  }
);

export const activityApi = {
  getActivities: (status) => {
    return api.get('/activities', { params: { status } });
  },
  
  getActivity: (id) => {
    return api.get(`/activities/${id}`);
  },
  
  createActivity: (data) => {
    return api.post('/activities', data);
  },
  
  updateActivity: (id, data) => {
    return api.put(`/activities/${id}`, data);
  },
  
  deleteActivity: (id) => {
    return api.delete(`/activities/${id}`);
  },
  
  startActivity: (id) => {
    return api.post(`/activities/${id}/start`);
  },
  
  stopActivity: (id) => {
    return api.post(`/activities/${id}/stop`);
  },
  
  claimActivity: (activityId, userId) => {
    return api.post(`/coupons/claim/${activityId}`, { userId });
  }
};

export const couponApi = {
  getCoupons: () => {
    return api.get('/coupons');
  },
  
  getCoupon: (id) => {
    return api.get(`/coupons/${id}`);
  },
  
  createCoupon: (data) => {
    return api.post('/coupons', data);
  },
  
  updateCoupon: (id, data) => {
    return api.put(`/coupons/${id}`, data);
  },
  
  deleteCoupon: (id) => {
    return api.delete(`/coupons/${id}`);
  },
  
  getUserCoupons: (userId, status) => {
    return api.get(`/coupons/user/${userId}`, { params: { status } });
  },
  
  useCoupon: (userCouponId, userId) => {
    return api.post(`/coupons/use/${userCouponId}`, { userId });
  }
};

export const statsApi = {
  getOverview: () => {
    return api.get('/stats/overview');
  },
  
  getActivityStats: () => {
    return api.get('/stats/activities');
  },
  
  getClaimRate: (hours) => {
    return api.get('/stats/claim-rate', { params: { hours } });
  },
  
  getCouponStats: () => {
    return api.get('/stats/coupon-stats');
  }
};

export default api;
