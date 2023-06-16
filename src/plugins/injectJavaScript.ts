export const PLUGINS = {
  yhdm: {
    searchCode: `
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
        });
        // alert(document.documentElement.innerHTML);
        window.ReactNativeWebView.postMessage(JSON.stringify({data, isEnd: true}));
  `,
    searchUrl: 'https://www.yhdmz.org/s_all?ex=1&kw={{kw}}',
    detailCode: `
  const uls = document.querySelectorAll('#play_tabs .main0 .movurl ul')
  
  const data = Array.from(uls).map(ul => {
    const als = ul.querySelectorAll('li a')
   return Array.from(als).map(a => ({href: a.href, title: a.textContent}))
  })

  window.ReactNativeWebView.postMessage(JSON.stringify(data));
  `,
    videoCode: `  const iframeSrc = document.querySelector('iframe').src;
  const videoUrl = iframeSrc.match(/url=(.*)/)[1];
  window.ReactNativeWebView.postMessage(videoUrl);`,
  },
  qfitv: {
    searchCode: `
    const lis = document.querySelectorAll('.module-items .module-item');

    const data = Array.from(lis).map(li => {
      const href = li.querySelector('a').href;
      const pic = li.querySelector('.module-item-pic img').src;
      const title = li.querySelector('.module-card-item-info .module-card-item-title strong').textContent
      return {
        href,pic,title
      }
    });
    window.ReactNativeWebView.postMessage(JSON.stringify({data, isEnd: true}));
  `,
    searchUrl: 'https://qfitv.com/index.php/vod/search/page/1/wd/{{kw}}.html',
    detailCode: `
  const uls = document.querySelectorAll('#play_tabs .main0 .movurl ul')
  
  const data = Array.from(uls).map(ul => {
    const als = ul.querySelectorAll('li a')
   return Array.from(als).map(a => ({href: a.href, title: a.textContent}))
  })

  window.ReactNativeWebView.postMessage(JSON.stringify(data));
  `,
    videoCode: `  const iframeSrc = document.querySelector('iframe').src;
  const videoUrl = iframeSrc.match(/url=(.*)/)[1];
  window.ReactNativeWebView.postMessage(videoUrl);`,
  },
};
