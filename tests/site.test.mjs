import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:5173';
await mkdir('qa',{recursive:true});
test('Custom backend and responsive storefront work together',async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function go(file){await page.goto(base+'/'+file);await page.waitForFunction(()=>window.LAI_ADMIN?.ready);}
 async function shot(file){await page.evaluate(()=>{for(const i of document.images)i.loading='eager';return document.fonts.ready});await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:'qa/'+file,fullPage:true})}
 await go('index.html');assert.equal(await page.locator('h1').textContent(),'萊一點');await shot('home-desktop.png');
 await go('admin.html');assert.equal(await page.getByRole('heading',{name:'管理員登入'}).count(),1);
 const denied=await page.request.put(base+'/api/content',{data:{data:{},revision:1}});assert.equal(denied.status(),403);
 await go('products.html');assert.equal(await page.locator('.product-card').count(),7);await page.getByRole('button',{name:'腸胃保養',exact:true}).click();assert.equal(await page.locator('.product-card').count(),1);
 await page.getByRole('button',{name:'全部',exact:true}).click();await page.getByRole('textbox',{name:'搜尋商品',exact:true}).fill('毛魚油');assert.equal(await page.locator('.product-card').count(),1);
 await go('index.html?ref=qa-partner');await go('product-gut.html');await page.getByRole('button',{name:'增加數量',exact:true}).click();await page.getByRole('button',{name:'加入購物車',exact:true}).click();await go('cart.html');assert.match(await page.locator('.summary-row.total').innerText(),/2,398/);
 await go('blog.html');assert.equal(await page.locator('.article-card').count(),6);await page.locator('.article-card a').first().click();await page.waitForFunction(()=>window.LAI_ADMIN?.ready);assert.equal(await page.locator('.toc>a').count(),3);await shot('article-desktop.png');
 await go('checkout.html');await page.locator('input[name="name"]').fill('測試毛孩家長');await page.getByRole('checkbox').check();await page.getByRole('button',{name:/建立示範訂單/}).click();await page.getByRole('heading',{name:'示範訂單已建立'}).waitFor();
 await page.goto(base+'/signin-with-chatgpt?return_to=/admin.html');await page.getByRole('heading',{name:'萊一點管理後台'}).waitFor();
 const baseline=await (await page.request.get(base+'/api/content')).json();
 try{
 const orders=await (await page.request.get(base+'/api/orders')).json();const order=orders.orders.find(o=>o.ref==='qa-partner');assert.equal(order.total,2398);assert.equal(order.commission,240);assert.equal(order.name,undefined);
 await page.getByRole('button',{name:'訂單與分潤',exact:true}).click();const row=page.locator('tr').filter({hasText:order.id});await row.getByRole('button',{name:'退款扣回',exact:true}).click();await row.getByText('已退款扣回').waitFor();
 await page.getByRole('button',{name:'商品管理',exact:true}).click();await page.getByRole('button',{name:'編輯',exact:true}).first().click();await page.locator('input[name="price"]').fill('1234');await page.getByRole('button',{name:/儲存商品/}).click();await page.locator('.admin-table').getByText('NT$ 1,234').waitFor();
 await go('product-gut.html');assert.match(await page.locator('.detail-copy .price').innerText(),/1,234/);
 await go('admin.html');await page.getByRole('button',{name:'SEO 與 Sitemap',exact:true}).click();await page.locator('#backend-seo-page').selectOption('product:gut');await page.locator('input[name="title"]').fill('毛暢快自訂 SEO');await page.locator('input[name="slug"]').fill('qa-gut');await page.getByRole('button',{name:'儲存 SEO',exact:true}).click();await page.locator('#toast').filter({hasText:'已儲存'}).waitFor();
 await go('qa-gut.html');assert.equal(await page.title(),'毛暢快自訂 SEO');const sitemap=await (await page.request.get(base+'/sitemap.xml')).text();assert.match(sitemap,/qa-gut.html/);
 await go('admin.html');await page.getByRole('button',{name:'圖片管理',exact:true}).click();await page.locator('input[name="file"]').setInputFiles('frontend/assets/cat.jpg');await page.getByRole('button',{name:'上傳',exact:true}).click();await page.getByRole('textbox',{name:'圖片網址'}).first().waitFor();
 await page.getByRole('button',{name:'首頁與促銷',exact:true}).click();await page.locator('input[name="heroCopy"]').fill('測試副標');await page.getByRole('button',{name:'儲存',exact:true}).click();await page.locator('#toast').filter({hasText:'已儲存'}).waitFor();await go('index.html');assert.equal(await page.locator('.hero h2').textContent(),'測試副標');
 await go('admin.html');await page.getByRole('button',{name:'文章管理',exact:true}).click();await page.getByRole('button',{name:'新增文章',exact:true}).click();await page.locator('input[name="title"]').fill('測試新文章');await page.locator('input[name="category"]').fill('測試分類');await page.locator('textarea[name="intro"]').fill('測試摘要');await page.locator('textarea[name="sections"]').fill('第一段 | 測試內容');await page.locator('select[name="status"]').selectOption('published');await page.getByRole('button',{name:'儲存文章',exact:true}).click();await page.locator('.admin-table').getByText('測試新文章').waitFor();await go('blog.html');assert.equal(await page.locator('.article-card').count(),7);
 }finally{const current=await (await page.request.get(base+'/api/content')).json();const r=await page.request.put(base+'/api/content',{data:{data:baseline.data,revision:current.revision},headers:{Origin:base}});assert.equal(r.status(),200)}
 for(const file of ['index.html','products.html','product-oil.html','blog.html','article-cat-daily.html','cart.html','admin.html','affiliate.html']){await page.setViewportSize({width:390,height:844});await go(file);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${file}`);if(file==='index.html')await shot('home-mobile.png');if(file==='products.html')await shot('products-mobile.png');if(file==='admin.html')await shot('admin-mobile.png');}
 await go('index.html');await page.getByRole('button',{name:'開啟選單',exact:true}).click();assert.ok(await page.locator('.mobile-nav.open').isVisible());await page.getByRole('button',{name:'搜尋',exact:true}).click();await page.locator('#global-search').fill('毛魚油');assert.match(await page.locator('#search-results').innerText(),/毛魚油/);await page.keyboard.press('Escape');assert.equal(await page.locator('.modal').count(),0);assert.deepEqual(errors,[]);
 }finally{await browser.close()}
});
