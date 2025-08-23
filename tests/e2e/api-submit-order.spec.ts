import { test, expect } from '@playwright/test';

test('后端提交接口（MOCK）可用并返回订单号', async ({ request, baseURL }) => {
  const url = new URL('/api/submit-order', baseURL!).toString();
  const response = await request.post(url, {
    multipart: {
      customization_style: '名画致敬款',
      phone: '13800138000'
    }
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.success).toBeTruthy();
  expect(json.orderId).toBeTruthy();
});