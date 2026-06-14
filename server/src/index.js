const express = require('express');
const cors = require('cors');
const activityRoutes = require('./routes/activityRoutes');
const couponRoutes = require('./routes/couponRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = 8763;

app.use(cors());
app.use(express.json());

app.use('/api/activities', activityRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '活动专区服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`活动专区后端服务已启动，端口: ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
