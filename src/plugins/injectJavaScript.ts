export default {
  gimy: `
  setTimeout(() => {
    const iframe = document.querySelectorAll('iframe')[2];
const iframeWindow = iframe.contentWindow;
const iframeXhrPrototype = iframeWindow.XMLHttpRequest.prototype;
// 保存原始的send方法
const originalSend = iframeXhrPrototype.send;

// 修改send方法
iframeXhrPrototype.send = function (...args) {
  const xhr = this;

  // 保存原始的onreadystatechange事件处理函数
  const originalOnReadyStateChange = xhr.onreadystatechange;

  // 修改onreadystatechange事件处理函数
  xhr.onreadystatechange = function () {
    // 判断是否为响应完成状态（readyState为4）
    if (xhr.readyState === 4) {
      // 自定义逻辑，例如记录响应信息等
      alert(111)
      if (xhr.responseURL && xhr.responseURL.includes('.m3u8')) {
        alert(xhr.responseURL)
        // window.ReactNativeWebView.postMessage(xhr.responseURL);
      }
    }

    // 调用原始的onreadystatechange事件处理函数
    if (typeof originalOnReadyStateChange === 'function') {
      originalOnReadyStateChange.apply(xhr, arguments);
    }
  };

  // 调用原始的send方法
  return originalSend.apply(this, args);
};
  });
  window.addEventListener("DOMContentLoaded", (event) => {
    
  });
  `,
  yhdm: `
  const lis = document.querySelectorAll('li.item')
  const data = Array.from(lis).map(li => {
    const href = li.querySelector('a').href;
    const imgblock = li.querySelector('.imgblock');
    const computedStyle = getComputedStyle(imgblock);
    const backgroundImage = computedStyle.getPropertyValue('background-image');
    
    const urlStartIndex = backgroundImage.indexOf('url("') + 5;
    const urlEndIndex = backgroundImage.lastIndexOf('")');
    const pic = backgroundImage.slice(urlStartIndex, urlEndIndex);

    const title = li.querySelector('.itemtext').textContent
    return {
      href,pic,title
    }
  })
  // alert(document.documentElement.innerHTML);
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
`,
};
