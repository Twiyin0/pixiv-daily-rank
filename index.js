const puppeteer = require('puppeteer');
const request = require('request');
const request2 = require('request');
const fs = require('fs');

// 获取时间
let nowDate = new Date();
let mth = nowDate.getMonth()+1;
let day = nowDate.getDate();

// 按时间创建文件夹
fs.mkdir(`./img/${mth}-${day}`, (err) => {
  if(err) console.log('未创建成功，可能是文件夹已存在'); // 如果出现错误就抛出错误信息
  else
  console.log('文件夹创建成功');
});

// 正则匹配函数,提取/img/后的内容
function urlMatch(str) {
  var patt1 = /\/img\/[^']*/;
  var r = str.match(patt1);
  return r[0];
}

// 图片下载模块
function getImg(url) {
  var fileName = url.slice(-11);
  request(url+'.png',function (error, response, data) {
    if (data.includes('<h1>404 Not Found</h1>')) {
     request2(url+'.jpg').pipe(fs.createWriteStream(`./img/${mth}-${day}/${fileName}.jpg`));
    }
    else {
     request2(url+'.png').pipe(fs.createWriteStream(`./img/${mth}-${day}/${fileName}.png`));
    }
 });
}

(async () => {
  const browser = await (puppeteer.launch({
    //设置超时时间
    timeout: 600000,
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true,
    // 打开开发者工具, 当此值为true时, headless总为false
    devtools: false,
    // 关闭headless模式, 不会打开浏览器
    headless: true
  }));
  const page = await browser.newPage();
  // 测试：窗口大小调整
  await page.setViewport({width: 1065,height: 4096});
  await page.goto('https://www.pixiv.net/ranking.php');
  // 等待标题元素加载
  await page.waitForSelector('._layout-thumbnail > img');
  await page.content();
  let fUrl = await page.$$eval('._layout-thumbnail > img', (links) => links.map((x) => x.src));
  // 输出获取的Url
  //console.log(fUrl);

  await page.screenshot({
    path: 'screenshotPixiviz.png'
  });

  for(var j=0;fUrl[j];j++) {
    if (fUrl[j].includes('gif')) j++;
    else {
      var imgUrl = urlMatch(fUrl[j]);
      var imgBody = "https://img.pixiv.cx/img-original" + imgUrl.slice(0,-15);
      getImg(imgBody);
      var fileName1 = imgBody.slice(-11);
      console.log(`保存${fileName1}成功!`);
    }
  }
  browser.close();
})();
