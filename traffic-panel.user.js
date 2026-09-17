// ==UserScript==
// @name         独立站轻量流量排名面板
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  右下角直接展示网站Tranco排名+AITDK预估月流量，适配iOS拦截100
// @author       custom
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const domain = window.location.hostname;
    // 悬浮面板样式
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '16px';
    panel.style.right = '12px';
    panel.style.background = '#111827';
    panel.style.color = '#ffffff';
    panel.style.padding = '10px';
    panel.style.borderRadius = '8px';
    panel.style.fontSize = '11px';
    panel.style.zIndex = '999999';
    panel.style.maxWidth = '220px';
    panel.textContent = `查询:${domain}`;
    document.body.appendChild(panel);

    // 并行拉取 AITDK流量 + Tranco排名
    let result = {traffic:"--",rank:"--"};
    let finishCount = 0;
    function updateUI(){
        finishCount++;
        panel.innerHTML = `<strong>${domain}</strong><br>
🌐Tranco排名：${result.rank}<br>
📊预估月访：${result.traffic}<br>
<small>数据源：AITDK+Tranco</small>`;
    }

    // 请求AITDK流量
    GM_xmlhttpRequest({
        method:"GET",
        url:`https://aitdk.com/overview?domain=${domain}`,
        onload(res){
            const html = res.responseText;
            const match = html.match(/Monthly Visits[^0-9]*([0-9,.]+[KMB]?)/i);
            if(match) result.traffic = match[1];
            updateUI();
        },
        onerror(){ updateUI(); }
    });

    // 请求Tranco排名
    GM_xmlhttpRequest({
        method:"GET",
        url:`https://tranco-list.eu/api/rank/domain/${domain}`,
        onload(res){
            try{
                const json = JSON.parse(res.responseText);
                if(json.rank) result.rank = json.rank.toLocaleString();
            }catch(e){}
            updateUI();
        },
        onerror(){ updateUI(); }
    });
})();
