import { test, expect, Page } from '@playwright/test';

// Small 1x1 PNG image buffer (base64 decoded)
const SMALL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

function makePng(name: string) {
  return { name, mimeType: 'image/png', buffer: Buffer.from(SMALL_PNG_BASE64, 'base64') } as const;
}

async function fillBasicInfo(page: Page, productId: number) {
  // 第一步：设定基础信息
  await page.getByRole('button', { name: '1只' }).click();
  // 按价格矩阵，单宠均支持“8寸”
  await page.getByRole('button', { name: '8寸' }).click();
  // 等待按钮可用，避免价格尚未计算完成导致禁用
  const nextBtn = page.getByRole('button', { name: '下一步：上传宠物照片' });
  await expect(nextBtn).toBeEnabled();
  await nextBtn.click();
}

async function uploadPetPhotos(page: Page, count: number) {
  const files = Array.from({ length: count }, (_, i) => makePng(`photo-${i + 1}.png`));
  await page.locator('input[type="file"]').setInputFiles(files);
  // 等待“下一步”按钮可用（FileReader 异步读入预览后 state 更新）
  const nextBtn = page.getByRole('button', { name: '下一步' });
  await expect(nextBtn).toBeEnabled();
  await nextBtn.click();
}

async function setSceneOrArtworkByText(page: Page, productId: number) {
  // 产品4会跳过第3步，直接进入订单确认
  if (productId === 4) return;
  await page.getByRole('button', { name: '文字描述' }).click();
  await page.getByRole('textbox').fill('请使用柔和的色调与温暖的光影，突出宠物的眼神。');
  const confirmBtn = page.getByRole('button', { name: '确认订单' });
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();
}

async function fillContactAndSubmit(page: Page) {
  // 填写联系电话并提交
  await page.getByLabel('联系电话 *').fill('13800138000');
  const submitBtn = page.getByRole('button', { name: '确认提交订单' });
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
}

function orderIdRegex() {
  const year = new Date().getFullYear();
  // 粗略匹配：PA-YYYYMMDD-XXXX-XXXXXX（后端目前为 YYYY + MMDD 共 4 位）
  return new RegExp(`^PA-${year}\\d{4}-\\d{4}-[A-Z0-9]{6}$`);
}

const productPhotoLimit: Record<number, number> = {
  1: 3,
  2: 3,
  3: 1,
  4: 1,
};

[1, 2, 3, 4].forEach((productId) => {
  test(`完整下单流程 - 产品 ${productId}`, async ({ page }) => {
    await page.goto(`/customize/${productId}`);

    await fillBasicInfo(page, productId);
    await uploadPetPhotos(page, productPhotoLimit[productId]);
    await setSceneOrArtworkByText(page, productId);
    await fillContactAndSubmit(page);

    // 跳转到提交成功页并校验订单号格式
    await expect(page.getByText('太棒了！您的定制需求已成功提交！')).toBeVisible();
    const idCandidate = await page.locator('span.text-xl.font-mono.font-bold').innerText();
    expect(idCandidate).toMatch(orderIdRegex());
  });
});

// 负面场景：照片类型错误的校验提示
[1].forEach((productId) => {
  test(`负面场景 - 非图片类型上传报错 - 产品 ${productId}`, async ({ page }) => {
    await page.goto(`/customize/${productId}`);

    await fillBasicInfo(page, productId);

    // 尝试上传一个非图片文件
    const badFile = { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello', 'utf-8') } as const;
    await page.locator('input[type="file"]').setInputFiles(badFile);

    // 期望看到错误提示
    await expect(page.getByText(/不支持的文件类型.*请上传 JPG 或 PNG 格式的图片/)).toBeVisible();

    // 继续上传有效图片至满足数量
    const validFiles = Array.from({ length: productPhotoLimit[productId] }, (_, i) => makePng(`ok-${i + 1}.png`));
    await page.locator('input[type="file"]').setInputFiles(validFiles);
    const nextBtn = page.getByRole('button', { name: '下一步' });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // 第三步，选择文字描述并进入确认页
    await setSceneOrArtworkByText(page, productId);

    // 确认按钮在未填写电话前应禁用
    await expect(page.getByRole('button', { name: '确认提交订单' })).toBeDisabled();

    // 填写电话并提交
    await fillContactAndSubmit(page);

    await expect(page.getByText('太棒了！您的定制需求已成功提交！')).toBeVisible();
  });
});

// 负面场景：下单接口返回错误
[3].forEach((productId) => {
  test(`负面场景 - 提交接口返回500 - 产品 ${productId}`, async ({ page }) => {
    await page.goto(`/customize/${productId}`);

    await fillBasicInfo(page, productId);
    await uploadPetPhotos(page, productPhotoLimit[productId]);
    await setSceneOrArtworkByText(page, productId);

    // 拦截提交接口，返回500
    await page.route('**/api/submit-order', async (route) => {
      await route.fulfill({ status: 500, body: 'server error' });
    });

    await fillContactAndSubmit(page);

    // 等待错误模态框出现
    await expect(page.getByRole('heading', { name: '系统服务异常' })).toBeVisible();
    
    // 检查错误信息
    await expect(page.getByText('server error')).toBeVisible();
    
    // 关闭错误模态框
    await page.getByRole('button', { name: '我知道了' }).click();

    // 仍留在确认页面（未跳转到成功页）
    await expect(page.getByRole('button', { name: '确认提交订单' })).toBeVisible();
  });
});