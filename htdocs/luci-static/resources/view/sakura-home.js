'use strict';
'require view';
'require poll';
'require rpc';
'require fs';
'require ui';

var callStatus = rpc.declare({
	object: 'luci.sakura_home',
	method: 'status',
	expect: {}
});

var callDkStatus = rpc.declare({
	object: 'luci.sakura_docker',
	method: 'status',
	expect: {}
});

var callDkCtl = rpc.declare({
	object: 'luci.sakura_docker',
	method: 'ctl',
	params: [ 'name', 'action' ],
	expect: {}
});

var callInitAction = rpc.declare({
	object: 'luci',
	method: 'setInitAction',
	params: [ 'name', 'action' ],
	expect: { result: true }
});

var callWeather = rpc.declare({
	object: 'luci.sakura_home',
	method: 'weather',
	expect: {}
});

var STYLE = [
'.sk-wrap{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:16px;align-items:start}',
'.sk-main{display:contents}',
'.sk-side{display:contents}',
'.sk-card.docker{grid-column:1 / 7;grid-row:6 / span 2;display:flex;flex-direction:column}',
'.sw{position:relative;display:inline-block;width:44px;height:23px;border-radius:99px;background:#C9B7C0;cursor:pointer;transition:background .25s;border:none;padding:0;flex:0 0 auto}',
'.sw::after{content:"";position:absolute;top:2.5px;left:2.5px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s;box-shadow:0 1px 3px rgba(0,0,0,.2)}',
'.sw.on{background:#3FC08A}',
'.sw.on::after{transform:translateX(21px)}',
'.sw:hover{opacity:.88}',
'.svc-st{font-size:.75rem;padding:1px 9px;border-radius:99px;white-space:nowrap}',
'.svc-st.run{background:rgba(63,192,138,.16);color:#2FA87A}',
'.svc-st.stop{background:rgba(200,180,190,.22);color:var(--text-color-low,currentColor)}',
'.dk-svc{margin-left:auto;display:flex;align-items:center;gap:.4rem;font-weight:400;font-size:.78rem}',
'.sk-dkb{padding:.35rem 0;border-bottom:1px solid var(--border-color-low,rgba(0,0,0,.05))}',
'.sk-dkd{display:flex;flex-wrap:wrap;gap:.15rem .9rem;padding:.15rem 0 0 .1rem;font-size:.73rem;color:var(--text-color-low,currentColor)}',
'.sk-dkd .di{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
'.sk-dk{display:flex;align-items:center;gap:.5rem;font-size:.83rem}',
'.sk-dklist{overflow-y:auto;flex:1 1 auto;margin-top:.2rem;scrollbar-width:thin}',
'.sk-dklist::-webkit-scrollbar{width:6px}',
'.sk-dklist::-webkit-scrollbar-thumb{background:rgba(120,90,110,.25);border-radius:3px}',
'.sk-dk{display:flex;align-items:center;gap:.5rem;padding:.35rem .1rem;font-size:.83rem;border-bottom:1px solid var(--border-color-low,rgba(0,0,0,.05))}',
'.sk-dk .nm{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-color-high,#2B2430);font-weight:600}',
'.sk-dk .st{flex:0 0 auto;font-size:.74rem;padding:1px 8px;border-radius:99px;white-space:nowrap}',
'.sk-dk .st.run{background:rgba(47,184,158,.16);color:#2FB89E}',
'.sk-dk .st.stop{background:rgba(200,180,190,.22);color:var(--text-color-low,currentColor)}',
'.sk-dk .up{flex:0 0 auto;font-size:.72rem;color:var(--text-color-low,currentColor);min-width:96px;text-align:right;white-space:nowrap}',
'.sk-dk .btns{flex:0 0 auto;display:flex;gap:.3rem}',
'.sk-dk .bt{margin:0;padding:.12rem .5rem;font-size:.72rem;border-radius:8px;cursor:pointer;border:1px solid var(--border-color-medium,rgba(0,0,0,.12));background:transparent;color:var(--text-color-high,#2B2430)}',
'.sk-dk .bt:hover{background:rgba(0,0,0,.05)}',
'.sk-dk .bt:disabled,.bt:disabled{opacity:.38;cursor:not-allowed;background:transparent}',
'.sk-dk .bt.pri:disabled,.bt.pri:disabled{opacity:.38}',
'.sk-dk .bt.pri{border-color:transparent;background:var(--primary,var(--primary-color-medium,#D6336C));color:#fff}',
'.sk-card.devices{grid-column:1 / 4;grid-row:4 / span 2;display:flex;flex-direction:column;min-height:260px}',
'.sk-card.traffic{grid-column:4 / 7;grid-row:4 / span 2;display:flex;flex-direction:column;min-height:260px}',
'.sk-card.nic{grid-column:7 / 9;grid-row:1 / span 2;display:flex;flex-direction:column;align-self:stretch}',
'.sk-card.disks{grid-column:7 / 9;grid-row:3 / span 5;display:flex;flex-direction:column;align-self:stretch}',
'.sk-wx{grid-column:1 / 7;grid-row:1}',
'.sk-grid.g1{grid-column:1 / 7;grid-row:2}',
'.sk-grid.g2{grid-column:1 / 7;grid-row:3}',
'.sk-side > .sk-card:not(.nic){flex:1 1 auto;display:flex;flex-direction:column}',
'.sk-disks{display:flex;flex-direction:column;gap:.7rem;overflow-y:auto;flex:1 1 auto;padding-right:4px;scrollbar-width:thin}',
'.sk-diskhead{display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.3rem}',
'.sk-diskhead .nm{color:var(--text-color-high,#2B2430);font-weight:600}',
'.sk-diskhead .pc{color:var(--text-color-low,currentColor);font-weight:600}',
'.sk-disksub{font-size:.75rem;margin-top:.28rem;color:var(--text-color-low,currentColor);opacity:.8}',
'.sk-bar.dk>i{background:linear-gradient(90deg,#7FE0D0,#2FB89E)}',
'.sk-bar.wn>i{background:linear-gradient(90deg,#FFC46B,#F0862B)}',
'.sk-bar.dg>i{background:linear-gradient(90deg,#FFA0A0,#E84545)}',
'.sk-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}',
'@media screen and (max-width:1150px){.sk-wrap{grid-template-columns:1fr}.sk-wx,.sk-grid.g1,.sk-grid.g2{grid-column:1}.sk-card.nic,.sk-card.disks{grid-column:1;grid-row:auto}}',
'@media screen and (max-width:760px){.sk-grid{grid-template-columns:1fr}}',
'.sk-card{align-self:stretch;-webkit-backdrop-filter:blur(var(--blur-radius,20px)) saturate(1.45);backdrop-filter:blur(var(--blur-radius,20px)) saturate(1.45);background:rgba(255,255,255,.82);background:var(--background-color-medium,rgb(255 255 255 / var(--blur-opacity,.82)));border-radius:18px;padding:14px 16px;box-shadow:0 6px 22px var(--shadow-color,rgba(120,80,100,.10));border:1px solid var(--border-color-medium,rgb(255 255 255 / .9));min-height:132px;display:flex;flex-direction:column}',
'.sk-title{font-size:.92rem;font-weight:600;color:var(--text-color-high,#2B2430);margin-bottom:.55rem;display:flex;align-items:center;gap:.4rem}',
'.sk-ico{width:24px;height:24px;object-fit:contain;flex:0 0 auto;filter:drop-shadow(0 1px 2px rgba(90,40,70,.45)) drop-shadow(0 0 1px rgba(255,255,255,.8))}',
'.sk-big{font-size:1.75rem;font-weight:700;color:var(--text-color-high,#2B2430);line-height:1.15;margin-bottom:.5rem}',
'.sk-bar{height:14px;border-radius:99px;background:var(--border-color-low,rgba(0,0,0,.08));overflow:hidden}',
'.sk-bar>i{background:linear-gradient(90deg,#FFA8CE,#FF6FA8)}',
'.sk-bar.pk>i{background:linear-gradient(90deg,#FFB0D0,#FF6FA8)}',
'.sk-bar.bl>i{background:linear-gradient(90deg,#A6D4FF,#5B8DEF)}',
'.sk-bar.rd>i{background:linear-gradient(90deg,#FFA0A0,#E84545)}',
'.sk-bar>i{display:block;height:100%;border-radius:99px;background:var(--primary,var(--primary-color-medium,var(--main-color,currentColor)));transition:width .4s}',
'.sk-sub{margin-top:.55rem;font-size:.8rem;color:var(--text-color-low,var(--text-color-medium,currentColor));opacity:.78}',
'.sk-sub b{color:#6B2E4A}',
'.nhead{display:flex;justify-content:space-between;align-items:center;font-size:.88rem;margin:.2rem 0 .55rem}',
'.nhead .stat.on{color:#2FB89E;font-weight:600}',
'.nhead .stat.off{color:#E84545;font-weight:600}',
'.nhead .up{color:var(--text-color-low,currentColor);font-size:.78rem}',
'.nr{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;font-size:.85rem;gap:.6rem}',
'.nr .kk{color:var(--text-color-low,var(--text-color,currentColor));white-space:nowrap}',
'.nr .vv-wrap{display:flex;align-items:center;gap:.4rem;min-width:0}',
'.nr .vv{color:var(--text-color-high,#2B2430);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px}',
'.sk-badge{font-size:.7rem;padding:1px 7px;border-radius:99px;background:rgba(0,0,0,.06);color:var(--text-color-low,currentColor);white-space:nowrap}',
'.stitle{font-size:.84rem;font-weight:600;color:var(--text-color-high,#2B2430);margin:.15rem 0 .5rem}',
'.sk-ports-box{display:flex;flex-direction:row;gap:.55rem;overflow-x:auto;overflow-y:hidden;padding-bottom:6px;scrollbar-width:thin}',
'.sk-ports-box::-webkit-scrollbar{height:5px}',
'.sk-ports-box::-webkit-scrollbar-track{background:transparent}',
'.sk-ports-box::-webkit-scrollbar-thumb{background:rgba(120,90,110,.22);border-radius:3px}',
'.sk-ports-box::-webkit-scrollbar-thumb:hover{background:rgba(120,90,110,.38)}',
'.sk-port{flex:0 0 auto;width:47%;min-width:130px;display:flex;align-items:center;gap:.55rem;padding:.5rem .6rem;border-radius:12px;background:rgba(0,0,0,.035)}',
'.sk-port .ic{font-size:1.1rem;flex:0 0 auto}',
'.sk-port > div{min-width:0}',
'.sk-port .pn{font-size:.83rem;font-weight:600;color:var(--text-color-high,#2B2430);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.sk-port .pd{display:flex;gap:.45rem;align-items:center;margin-top:.15rem;font-size:.74rem}',
'.sk-port .link.on{color:#2FB89E}.sk-port .link.off{color:#C9B7C0}',
'.sk-port .spd{padding:1px 6px;border-radius:99px;background:rgba(47,184,158,.14);color:#2FB89E;font-weight:600}',
'.sk-row{display:flex;align-items:center;padding:.32rem 0;font-size:.82rem;gap:.4rem}',
'.sk-rhead{color:var(--text-color-low,currentColor);font-size:.75rem;font-weight:600;padding-bottom:.2rem;border-bottom:1px solid var(--border-color-low,rgba(0,0,0,.08));position:sticky;top:0;background:transparent}',
'.sk-row .c1{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-color-high,#2B2430);font-weight:600}',
'.sk-row .c2{flex:0 0 auto;min-width:78px;text-align:right;color:var(--text-color-low,currentColor)}',
'.sk-row .c3{flex:0 0 auto;min-width:56px;text-align:right;white-space:nowrap}',
'.sk-row .c3x{flex:0 0 auto;min-width:78px;text-align:right;white-space:nowrap}',
'.sk-row .st.on{color:#2FB89E;font-weight:600}',
'.sk-row .st.off{color:#C9B7C0}',
'.sk-rhead .sk-up,.sk-row .sk-up{color:#E84545}',
'.sk-rhead .sk-dn,.sk-row .sk-dn{color:#2E86DE}',
'.sk-devlist{overflow-y:auto;flex:1 1 auto;margin-top:.2rem;padding-right:4px;scrollbar-width:thin}',
'.sk-devlist::-webkit-scrollbar{width:5px}',
'.sk-devlist::-webkit-scrollbar-thumb{background:rgba(120,90,110,.22);border-radius:3px}',
'.sk-dev{display:flex;align-items:center;gap:.5rem;padding:.3rem 0;font-size:.83rem}',
'.sk-dev .dn{color:var(--text-color-high,#2B2430);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1 1 auto}',
'.sk-dev .di{color:var(--text-color-low,currentColor);font-size:.76rem;white-space:nowrap}',
'.sk-tv{display:flex;justify-content:space-between;align-items:center;padding:.42rem 0;font-size:.85rem;border-bottom:1px solid var(--border-color-low,rgba(0,0,0,.06))}',
'.sk-tv:last-child{border-bottom:none}',
'.sk-tv .tk{color:var(--text-color-low,currentColor)}',
'.sk-tv .tv{color:var(--text-color-high,#2B2430);font-weight:700}',
'.sk-tv .tu{color:#E84545}',
'.sk-tv .td{color:#2E86DE}',
'.sk-netsep{height:1px;background:var(--border-color-low,rgba(0,0,0,.08));margin:.5rem 0}',
'.sk-kv .r{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;font-size:.85rem;gap:.8rem}',
'.sk-kv .k{color:var(--text-color-low,var(--text-color-medium,currentColor));opacity:.75;white-space:nowrap}',
'.sk-kv .v{color:var(--text-color-high,var(--text-color,inherit));text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.sk-net{display:flex;gap:1.4rem;margin:.2rem 0 .6rem}',
'.sk-net .v{font-size:1.05rem;font-weight:700;color:var(--text-color-high,#2B2430);display:flex;align-items:center;gap:4px}',
'.sk-net .v .arw{font-size:1.05rem;line-height:1;font-weight:800}',
'.sk-net .v .arw.up{color:#7A6BE0}',
'.sk-net .v .arw.dn{color:#FF5C9E}',
'.sk-net .v .num{color:var(--text-color-high,#2B2430)}',
'.sk-net .l{font-size:.78rem;color:#9A7A88;margin-top:.1rem}',
'.sk-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#C9B7C0;margin-right:.35rem;vertical-align:middle}',
'.sk-dot.ok{background:var(--primary,var(--primary-color-medium,var(--success-color-medium,#3FC08A)));box-shadow:0 0 0 3px rgb(0 0 0 / .06)}',
'.sk-chart{display:block;width:100%;height:56px}',


/* 当前时间 ✓ */
'.sk-wx .wclock{margin-left:auto;font-size:1.12rem;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;position:relative;z-index:3;letter-spacing:.02em}',
'.sk-wx .wclock small{font-size:.72rem;font-weight:400;opacity:.75;margin-left:.35rem}',
'.sk-wx .wtmpwrap{margin-left:.9rem}',
'.sk-wx.sun .wclock{color:#8A5514}',
'.sk-wx.rain .wclock,.sk-wx.cloud .wclock{color:#2B3E52}',
/* 深色天空（夜/暮）→ 文字转浅色 ✓ 保证可读 ✓ */
/* ===== 写实动态天空 ✗ 按真实时刻变化 ✓ ===== */
'.sk-wx{background:#8FBBE0}',                            /* 兜底 ✓ */
'.sky{position:absolute;inset:0;z-index:0;overflow:hidden}',
'.sky .grad{position:absolute;inset:0;transition:background 3s linear}',
'.sky .celestial{position:absolute;width:26px;height:26px;border-radius:50%;transition:all 3s linear;z-index:1}',
'.sky .sun{background:radial-gradient(circle,#FFF6C8 30%,#FFD166 65%,rgba(255,190,60,0) 72%);box-shadow:0 0 30px rgba(255,200,80,.75)}',
'.sky .moon{background:radial-gradient(circle at 35% 35%,#FDFDF6 45%,#D8DCE4 70%,rgba(210,215,225,0) 76%);box-shadow:0 0 22px rgba(220,230,255,.6)}',
'.sky .star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;animation:twk 3s ease-in-out infinite}',
'.sky .cloud{position:absolute;border-radius:99px;filter:blur(6px);opacity:.65}',
'.sk-wx .wicon,.sk-wx .wtxt,.sk-wx .wtmpwrap,.sk-wx .wmeta{position:relative;z-index:3}',
'@keyframes twk{0%,100%{opacity:.35}50%{opacity:1}}',
'@keyframes cld{0%{transform:translateX(-20%)}100%{transform:translateX(120%)}}',

/* ===== 天气动态背景（按 anim 类型变化 ✓）===== */
'.sk-wx.sun{background:linear-gradient(135deg,rgba(255,246,214,.88),rgba(255,214,150,.82))}',
'.sk-wx.sun .wicon{filter:drop-shadow(0 0 12px rgba(255,180,60,.55))}',
'.sk-wx.cloud{background:linear-gradient(135deg,rgba(232,238,246,.90),rgba(190,206,224,.86))}',
'.sk-wx.rain{background:linear-gradient(135deg,rgba(208,226,240,.90),rgba(150,180,210,.86))}',
'.sk-wx.rain .wicon,.sk-wx.storm .wicon{filter:drop-shadow(0 0 10px rgba(90,140,200,.5))}',
'.sk-wx.snow{background:linear-gradient(135deg,rgba(240,247,252,.92),rgba(206,224,240,.88))}',
'.sk-wx.fog{background:linear-gradient(135deg,rgba(232,230,228,.92),rgba(200,196,192,.88))}',
'.sk-wx.storm{background:linear-gradient(135deg,rgba(206,200,228,.90),rgba(140,132,180,.86))}',
'.sk-wx.storm .wcity{color:#fff}',
'.sk-wx.storm .wdesc,.sk-wx.storm .wmeta,.sk-wx.storm .wrange{color:rgba(255,255,255,.92);opacity:1}',
'.sk-wx.storm .wtmp{color:#fff}',
'.sk-wx.rain .wcity,.sk-wx.cloud .wcity{color:#2B3E52}',
'.sk-wx.sun .wcity{color:#7A4A10}',
'.sk-wx.sun .wtmp{color:#C25E00}',
'.sk-wx.rain .wtmp{color:#1F5C96}',
'.sk-wx.cloud .wtmp{color:#3A5670}',
'.sk-wx.snow .wtmp{color:#3A6B96}',
'.sk-wx.sun .sk-sunray{display:block}',
,
'.sk-wx{width:100%;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;',
'padding:16px 22px;margin-bottom:16px;border-radius:18px;min-height:132px;',
'-webkit-backdrop-filter:blur(var(--blur-radius,20px)) saturate(1.45);backdrop-filter:blur(var(--blur-radius,20px)) saturate(1.45);',
'background:rgba(255,255,255,.82);background:var(--background-color-medium,rgb(255 255 255 / var(--blur-opacity,.82)));',
'border:1px solid var(--border-color-medium,rgb(255 255 255 / .9));box-shadow:0 6px 22px var(--shadow-color,rgba(120,80,100,.10))}',
'.sk-wx .wicon{font-size:2.8rem;line-height:1;position:relative;z-index:3;animation:skBob 2.6s ease-in-out infinite;transform:translateZ(0);will-change:transform;backface-visibility:hidden}',
'.sk-wx .wtxt{position:relative;z-index:2}',
'.sk-wx .wcity{font-size:1.1rem;font-weight:700;color:var(--primary,var(--primary-color-medium,currentColor))}',
'.sk-wx .wdesc{font-size:.84rem;margin-top:.25rem;color:var(--text-color-low,var(--text-color-medium,currentColor));opacity:.85}',
'.sk-wx .wtmp{font-size:2.2rem;font-weight:800;line-height:1.05;position:relative;z-index:2;color:var(--primary,var(--primary-color-medium,currentColor))}',
'.sk-wx .wtmpwrap{margin-left:auto;text-align:right;position:relative;z-index:2}',
'.sk-wx .wrange{font-size:.78rem;margin-top:.3rem;color:var(--text-color-low,var(--text-color-medium,currentColor));opacity:.9;white-space:nowrap}',
'.sk-wx .wrange b{font-weight:600}',
'.sk-wx .wmeta{display:flex;gap:18px;font-size:.82rem;position:relative;z-index:2;color:var(--text-color-low,var(--text-color-medium,currentColor));opacity:.9}',
'.sk-wx .wmeta b{color:var(--text-color-high,var(--text-color,inherit))}',
'@keyframes skBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
'@keyframes skRain{0%{transform:translateY(-30px)}100%{transform:translateY(150px)}}',
'@keyframes skSnow{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(150px) rotate(360deg)}}',
'@keyframes skDrift{0%{transform:translateX(-15%)}100%{transform:translateX(115%)}}',
'@keyframes skPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.15);opacity:1}}',
'.sk-wx .p{position:absolute;top:0;pointer-events:none;z-index:1;transform:translateZ(0);will-change:transform;backface-visibility:hidden}',
'.sk-wx.rain .p{width:2px;height:16px;border-radius:2px;background:linear-gradient(transparent,rgba(120,170,255,.75));animation:skRain .85s linear infinite}',
'.sk-wx.snow .p{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.95);box-shadow:0 0 4px rgba(180,200,255,.8);animation:skSnow 3.4s linear infinite}',
'.sk-wx.cloud .p,.sk-wx.fog .p{width:90px;height:30px;border-radius:99px;background:radial-gradient(ellipse at center,rgba(255,255,255,.72),rgba(255,255,255,0) 72%);animation:skDrift 16s linear infinite}',
'.sk-wx.sun .p{width:56px;height:56px;border-radius:50%;background:radial-gradient(circle,rgba(255,220,130,.55),transparent 70%);animation:skPulse 3.2s ease-in-out infinite}',
'.sk-wx.storm .p{width:2px;height:18px;border-radius:2px;background:linear-gradient(transparent,rgba(150,120,255,.8));animation:skRain .5s linear infinite}',
	/* ===== 深色天空文字（放最后 ✓ 同优先级时后写生效 ✓）===== */
	'.sk-wx.darksky .wclock{color:#fff !important}',
	'.sk-wx.darksky .wcity{color:#fff !important}',
	'.sk-wx.darksky .wtmp{color:#fff !important}',
	'.sk-wx.darksky .wdesc,.sk-wx.darksky .wmeta,.sk-wx.darksky .wrange{color:rgba(255,255,255,.92) !important;opacity:1 !important}',
	'.sk-wx.darksky .wclock small{color:rgba(255,255,255,.8)}',

].join('\n');

function pct(x) {
	if (x == null || isNaN(x)) return '—';
	if (x < 1) return (x.toFixed(2) + '%');
	return (x < 10) ? (x.toFixed(1) + '%') : (Math.round(x) + '%');
}

function shortFw(s) {
	var m = String(s || '').match(/^([A-Za-z]+)\s+([\d.]+)/);
	return m ? (m[1] + ' ' + m[2]) : s;
}

function clockText() {
	var d = new Date();
	function p(n) { return (n < 10 ? '0' : '') + n; }
	return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function clockDay() {
	var d = new Date();
	var wd = [ '周日', '周一', '周二', '周三', '周四', '周五', '周六' ][d.getDay()];
	return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + wd;
}

function skyFor(h) {
	var presets = [
		{ h: 0,  g: 'linear-gradient(180deg,#081428,#132A4A)',      star: 1,    sun: null, dark: true },
		{ h: 5,  g: 'linear-gradient(180deg,#22335C,#C97B6B)',      star: 0.45, sun: 'rise', dark: true },
		{ h: 7,  g: 'linear-gradient(180deg,#5FA8DE,#CFE6F5)',      star: 0,    sun: 'low' },
		{ h: 10, g: 'linear-gradient(180deg,#2E8FD6,#A9D8F0)',      star: 0,    sun: 'high' },
		{ h: 16, g: 'linear-gradient(180deg,#F0A65C,#C9637E)',      star: 0.1,  sun: 'set' },
		{ h: 19, g: 'linear-gradient(180deg,#3E3A66,#7C5C8E)',      star: 0.5,  sun: 'dusk', dark: true },
		{ h: 21, g: 'linear-gradient(180deg,#081428,#132A4A)',      star: 1,    sun: null, dark: true },
		{ h: 24, g: 'linear-gradient(180deg,#081428,#132A4A)',      star: 1,    sun: null, dark: true }
	];
	var cur = presets[0];
	for (var i = 0; i < presets.length; i++) {
		if (h >= presets[i].h) cur = presets[i];
	}
	return cur;
}

function skyCard(w) {
	var h = new Date().getHours();
	var p = skyFor(h);
	var sky = E('div', { 'class': 'sky' }, []);
	sky.appendChild(E('div', { 'class': 'grad', 'style': 'background:' + p.g }));

	/* 星星（夜里 ✓） */
	if (p.star > 0) {
		for (var i = 0; i < 26; i++) {
			var s = E('div', { 'class': 'star' });
			s.style.left = (Math.random() * 100).toFixed(1) + '%';
			s.style.top = (Math.random() * 70).toFixed(1) + '%';
			s.style.opacity = (p.star * (0.4 + Math.random() * 0.6)).toFixed(2);
			s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
			sky.appendChild(s);
		}
	}

	/* 太阳/月亮（走弧线 ✓） */
	if (p.sun) {
		var pos = { rise: [12, 78], low: [28, 55], high: [50, 14], set: [78, 52], dusk: [88, 74] }[p.sun] || [50, 20];
		var c = E('div', { 'class': 'celestial sun' });
		c.style.left = pos[0] + '%';
		c.style.top = pos[1] + '%';
		sky.appendChild(c);
	} else {
		var m = E('div', { 'class': 'celestial moon' });
		m.style.left = '72%';
		m.style.top = '16%';
		sky.appendChild(m);
	}

	/* 云（按天气 ✓） */
	var anim2 = (w && w.anim) ? w.anim : '';
	var n = (anim2 === 'cloud' || anim2 === 'fog') ? 5 : 2;
	for (var i = 0; i < n; i++) {
		var cl = E('div', { 'class': 'cloud' });
		var cw = 60 + Math.random() * 90;
		cl.style.width = cw.toFixed(0) + 'px';
		cl.style.height = (cw * 0.32).toFixed(0) + 'px';
		cl.style.left = '-20%';
		cl.style.top = (8 + Math.random() * 55).toFixed(0) + '%';
		cl.style.background = (anim2 === 'rain' || anim2 === 'storm')
			? 'rgba(120,135,155,.85)' : 'rgba(255,255,255,.92)';
		cl.style.opacity = (anim2 === 'cloud' || anim2 === 'fog' || anim2 === 'rain') ? 0.75 : 0.45;
		cl.style.animation = 'cld ' + (26 + Math.random() * 22).toFixed(0) + 's linear infinite';
		cl.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
		sky.appendChild(cl);
	}
	return sky;
}

function weatherCard(w) {
	var anim = (w && w.anim) ? w.anim : 'none';
	var _h = new Date().getHours();
	var _p = skyFor(_h);
	var box = E('div', { 'class': 'sk-wx ' + anim + (_p.dark ? ' darksky' : '') });
	box.appendChild(skyCard(w));
	var city = (w && w.city) ? w.city : '定位中…';
	var extra = (w && w.region && w.region !== w.city) ? (' · ' + w.region) : '';
	box.appendChild(E('div', { 'class': 'wicon' }, [ (w && w.icon) || '🌡️' ]));
	box.appendChild(E('div', { 'class': 'wtxt' }, [
		E('div', { 'class': 'wcity' }, [ city + extra ]),
		E('div', { 'class': 'wdesc' }, [ '今日 ' + ((w && w.desc) || '') ])
	]));
	box.appendChild(E('div', { 'class': 'wclock' }, [
		clockText(),
		E('small', {}, [ clockDay() ])
	]));
	box.appendChild(E('div', { 'class': 'wtmpwrap' }, [
		E('div', { 'class': 'wtmp' }, [ ((w && w.temp && w.temp !== '—') ? (w.temp + '℃') : '—') ]),
		E('div', { 'class': 'wrange' }, [
			'最高 ' + ((w && w.tmax) ? w.tmax : '—') + '°　最低 ' + ((w && w.tmin) ? w.tmin : '—') + '°'
		])
	]));
	box.appendChild(E('div', { 'class': 'wmeta' }, [
		E('span', {}, [ '体感 ', E('b', {}, [ ((w && w.feels) || '—') + '℃' ]) ]),
		E('span', {}, [ '湿度 ', E('b', {}, [ ((w && w.hum) || '—') + '%' ]) ]),
		E('span', {}, [ '风速 ', E('b', {}, [ ((w && w.wind) || '—') + ' km/h' ]) ])
	]));
	/* 动态粒子 ✓ */
	var n = (anim === 'rain' || anim === 'storm') ? 22 : (anim === 'snow' ? 16 : (anim === 'cloud' || anim === 'fog' ? 3 : 1));
	for (var i = 0; i < n; i++) {
		var d = E('div', { 'class': 'p' });
		d.style.left = (Math.random() * 100).toFixed(1) + '%';
		d.style.animationDelay = (Math.random() * (anim === 'rain' || anim === 'storm' ? 0.9 : 3.4)).toFixed(2) + 's';
		if (anim === 'sun') { d.style.left = '78%'; d.style.top = '-6px'; }
		if (anim === 'cloud' || anim === 'fog') { d.style.top = (12 + i * 26) + 'px'; }
		box.appendChild(d);
	}
	return box;
}

function disksCard(s) {
	var ds = (s && s.disks) ? s.disks : [];
	var items = [];
	for (var i = 0; i < ds.length; i++) {
		var d = ds[i];
		var nm = (d.mount === '/') ? '系统盘 /' : (d.mount === '/tmp' ? '内存盘 /tmp' : d.mount);
		var p = Math.max(0, Math.min(100, d.pct || 0));
		var cls = (p >= 85) ? 'dg' : (p >= 65 ? 'wn' : 'dk');
		items.push(E('div', {}, [
			E('div', { 'class': 'sk-diskhead' }, [
				E('span', { 'class': 'nm' }, [ nm ]),
				E('span', { 'class': 'pc' }, [ (d.pct_s || (Math.round(p) + '%')) ])
			]),
			E('div', { 'class': 'sk-bar ' + cls }, [ E('i', { 'style': 'width:' + p.toFixed(1) + '%' }) ]),
			E('div', { 'class': 'sk-disksub' }, [ (d.used_s || '—') + ' / ' + (d.total_s || '—') + '　可用 ' + (d.avail_s || '—') ])
		]));
	}
	if (!items.length) items.push(E('div', { 'class': 'sk-sub' }, [ '暂无磁盘信息' ]));
	return E('div', { 'class': 'sk-card disks' }, [
		E('div', { 'class': 'sk-title' }, [ icoImg('info'), '磁盘存储' ]),
		E('div', { 'class': 'sk-disks' }, items)
	]);
}

function devName(d) {
	if (d.name) return d.name;
	if (d.mac && String(d.mac).length > 11) return d.mac;
	return d.ip;
}

function devicesCard(s) {
	var ds = (s && s.devices) ? s.devices.slice() : [];
	/* 在线优先 + 按 IP 排序 ✓ */
	ds.sort(function (a, b) {
		if (!!b.online !== !!a.online) return b.online ? 1 : -1;
		return String(a.ip).localeCompare(String(b.ip));
	});
	var on = 0;
	for (var i = 0; i < ds.length; i++) if (ds[i].online) on++;

	var head = E('div', { 'class': 'sk-row sk-rhead' }, [
		E('span', { 'class': 'c1' }, [ '设备名' ]),
		E('span', { 'class': 'c2' }, [ 'IP 地址' ]),
		E('span', { 'class': 'c3' }, [ '状态' ])
	]);
	var items = [head];
	for (var i = 0; i < ds.length; i++) {
		var d = ds[i];
		items.push(E('div', { 'class': 'sk-row' }, [
			E('span', { 'class': 'c1', 'title': devName(d) }, [ devName(d) ]),
			E('span', { 'class': 'c2' }, [ d.ip ]),
			E('span', { 'class': 'c3' }, [
				E('span', { 'class': 'sk-dot' + (d.online ? ' ok' : '') }),
				E('span', { 'class': 'st ' + (d.online ? 'on' : 'off') }, [ d.online ? '在线' : '离线' ])
			])
		]));
	}
	if (ds.length === 0) items.push(E('div', { 'class': 'sk-sub' }, [ '暂无设备' ]));
	return E('div', { 'class': 'sk-card devices' }, [
		E('div', { 'class': 'sk-title' }, [ icoImg('if'), '在线设备 ' + on + ' / ' + ds.length ]),
		E('div', { 'class': 'sk-devlist' }, items)
	]);
}

function trafficCard(s) {
	var ds = (s && s.devices) ? s.devices.slice() : [];
	var rows = [];
	for (var i = 0; i < ds.length; i++) {
		var d = ds[i];
		var rxb = d.rx || 0, txb = d.tx || 0;
		if (rxb + txb <= 0) continue;
		rows.push({ d: d, tot: rxb + txb });
	}
	rows.sort(function (a, b) { return b.tot - a.tot; });

	var head = E('div', { 'class': 'sk-row sk-rhead' }, [
		E('span', { 'class': 'c1' }, [ '设备名' ]),
		E('span', { 'class': 'c2 sk-up' }, [ '↑ 上传' ]),
		E('span', { 'class': 'c3x sk-dn' }, [ '↓ 下载' ])
	]);
	var items = [ head ];
	for (var i = 0; i < rows.length && i < 30; i++) {
		var d = rows[i].d;
		items.push(E('div', { 'class': 'sk-row' }, [
			E('span', { 'class': 'c1', 'title': devName(d) }, [ devName(d) ]),
			E('span', { 'class': 'c2 sk-up' }, [ d.tx_s || '—' ]),
			E('span', { 'class': 'c3x sk-dn' }, [ d.rx_s || '—' ])
		]));
	}
	var isNlbw = (rows.length > 0 && rows[0].d.src === 'nlbw');
	if (rows.length === 0) items.push(E('div', { 'class': 'sk-sub' }, [ '暂无流量数据' ]));

	var t = (s && s.traffic) ? s.traffic : {};
	var note = isNlbw ? '今日累计 ✓' : (rows.length > 0 ? '当前连接（非累计 ⚠️）' : '暂无数据');
	return E('div', { 'class': 'sk-card traffic' }, [
		E('div', { 'class': 'sk-title' }, [ icoImg('net'), '流量使用情况' ]),
		E('div', { 'class': 'sk-devlist' }, items),
		E('div', { 'class': 'sk-tv' }, [
			E('span', { 'class': 'tk' }, [ note ]),
			E('span', { 'class': 'tv' }, [ t.tot_total_s || '—' ])
		])
	]);
}

var __dkBusy = false;

function dockerLoad() {
	return callDkStatus().then(function (r) {
		var list = (r && r.containers) ? r.containers : [];
		window.__sk_dk = list;
		window.__sk_dksvc = (r && r.service === true);
		return list;
	}).catch(function (e) {
		window.__sk_dk = [];
		window.__sk_dksvc = false;
		window.__sk_dkerr = 'RPC错误: ' + ((e && e.message) ? e.message : String(e));
		return [];
	});
}

function dockerSvc(act) {
	__dkBusy = true;
	if (window.__sk_st && window.__sk_draw) window.__sk_draw(window.__sk_st);
	return callInitAction('dockerd', act)
		.catch(function (e) {
			ui.addNotification(null, E('p', {}, [ 'Docker ' + (act === 'start' ? '启动' : '关闭') + '失败：' + (e && e.message ? e.message : e) ]), 'error');
		})
		.then(function () { return new Promise(function (r) { setTimeout(r, 2000); }); })
		.then(function () { return dockerLoad(); })
		.then(function () { __dkBusy = false; if (window.__sk_st && window.__sk_draw) window.__sk_draw(window.__sk_st); });
}

function dockerAct(name, act) {
	if (__dkBusy) return Promise.resolve();
	__dkBusy = true;
	if (window.__sk_st && window.__sk_draw) window.__sk_draw(window.__sk_st);
	return callDkCtl(name, act)
		.catch(function (e) {
			ui.addNotification(null, E('p', {}, [ '容器 ' + name + ' 操作失败：' + (e && e.message ? e.message : e) ]), 'error');
		})
		.then(function () { return new Promise(function (r) { setTimeout(r, 1200); }); })
		.then(function () { return dockerLoad(); })
		.then(function () { __dkBusy = false; if (window.__sk_st && window.__sk_draw) window.__sk_draw(window.__sk_st); });
}

function dockerCard() {
	var list = window.__sk_dk || [];
	var svcOn = (window.__sk_dksvc === true);
	var run = 0;
	for (var i = 0; i < list.length; i++) if (list[i].state === 'running') run++;

	var sw = E('button', {
		'class': 'sw' + (svcOn ? ' on' : ''),
		'title': svcOn ? '点击关闭 Docker' : '点击启动 Docker',
		'click': function () { if (!__dkBusy) return dockerSvc(svcOn ? 'stop' : 'start'); }
	});
	var stBadge = E('span', { 'class': 'svc-st ' + (svcOn ? 'run' : 'stop') }, [ svcOn ? '运行中' : '已停止' ]);
	var svcBtn = E('span', { 'style': 'display:inline-flex;align-items:center;gap:.45rem;margin-left:.5rem' }, [ sw, stBadge ]);

	var title = E('div', { 'class': 'sk-title' }, [
		icoImg('info'), 'Docker 容器 ' + run + ' / ' + list.length,
		E('span', { 'class': 'dk-svc' }, [
			E('span', { 'style': 'font-weight:400;font-size:.8rem' }, [ '当前状态：' ]),
			svcBtn
		])
	]);

	var items = [];
	for (var i = 0; i < list.length; i++) {
		var c = list[i];
		var isRun = (c.state === 'running');
		var btns = [];
		if (isRun) {
			btns.push(E('button', { 'class': 'bt', 'click': function (n) { return function () { dockerAct(n, 'restart'); }; }(c.name) }, [ '重启' ]));
			btns.push(E('button', { 'class': 'bt', 'click': function (n) { return function () { dockerAct(n, 'stop'); }; }(c.name) }, [ '停止' ]));
		} else {
			btns.push(E('button', { 'class': 'bt pri', 'click': function (n) { return function () { dockerAct(n, 'start'); }; }(c.name) }, [ '启动' ]));
		}
		var detail = [];
		detail.push(E('span', { 'class': 'di' }, [ '📦 ' + (c.image || '—') ]));
		detail.push(E('span', { 'class': 'di' }, [ '🔌 ' + (c.ports || '无端口') ]));
		detail.push(E('span', { 'class': 'di' }, [ '💾 ' + (c.mounts || '无挂载') ]));
		detail.push(E('span', { 'class': 'di' }, [ '🌐 ' + (c.nets || '—') ]));
		items.push(E('div', { 'class': 'sk-dkb' }, [
			E('div', { 'class': 'sk-dk' }, [
				E('span', { 'class': 'nm', 'title': c.name }, [ c.name ]),
				E('span', { 'class': 'st ' + (isRun ? 'run' : 'stop') }, [ isRun ? '运行中' : '已停止' ]),
				E('span', { 'class': 'up' }, [ c.status || '' ]),
				E('span', { 'class': 'btns' }, btns)
			]),
			E('div', { 'class': 'sk-dkd' }, detail)
		]));
	}
	if (list.length === 0) {
		var msg = window.__sk_dkerr ? ('调用出错：' + window.__sk_dkerr) : (svcOn ? '暂无容器' : 'Docker 服务未运行');
		items.push(E('div', { 'class': 'sk-sub' }, [ msg ]));
	}

	return E('div', { 'class': 'sk-card docker' }, [
		title,
		E('div', { 'class': 'sk-dklist' }, items)
	]);
}

function netInfoCard(s) {
	function row(k, v, badge) {
		var right = [];
		if (badge) right.push(E('span', { 'class': 'sk-badge' }, [ badge ]));
		right.push(E('span', { 'class': 'vv', 'title': String(v || '') }, [ String(v || '—') ]));
		return E('div', { 'class': 'nr' }, [
			E('span', { 'class': 'kk' }, [ k ]),
			E('span', { 'class': 'vv-wrap' }, right)
		]);
	}

	var ok = (s.wan_ok === true);
	var head = E('div', { 'class': 'nhead' }, [
		E('span', { 'class': 'stat ' + (ok ? 'on' : 'off') }, [ ok ? '✓ 网络连接正常'
			: ('✗ ' + (s.net_reason && String(s.net_reason).length ? String(s.net_reason) : '网络连接异常')) ]),
		E('span', { 'class': 'up' }, [ s.wan_uptime_s || '—' ])
	]);

	var v4badge = s.wan_proto ? String(s.wan_proto).toUpperCase() : '';
	var ds = s.disks || [];
	var portBlocks = [];
	var ps = s.ports || [];
	for (var i = 0; i < ps.length; i++) {
		var p = ps[i];
		var nm = p.name + (p.roles ? ' (' + p.roles + ')' : '');
		portBlocks.push(E('div', { 'class': 'sk-port' }, [
			E('span', { 'class': 'ic' }, [ '🔌' ]),
			E('div', { 'class': 'info' }, [
				E('div', { 'class': 'pn' }, [ nm ]),
				E('div', { 'class': 'pd' }, [
					E('span', { 'class': 'link ' + (p.up ? 'on' : 'off') }, [ p.up ? '已连接' : '未连接' ]),
					p.speed ? E('span', { 'class': 'spd' }, [ p.speed ]) : ''
				])
			])
		]));
	}
	if (!portBlocks.length) portBlocks.push(E('div', { 'class': 'sk-sub' }, [ '无端口信息' ]));
	var portWrap = E('div', { 'class': 'sk-ports' }, []);

	return E('div', { 'class': 'sk-card nic' }, [
		E('div', { 'class': 'sk-title' }, [ icoImg('if'), '网络连接和 IP 地址' ]),
		head,
		E('div', { 'class': 'sk-netsep' }),
		E('div', { 'class': 'sk-kv' }, [
			row('IPv4' + (s.wan_if ? '（' + s.wan_if + '）' : ''), s.wan4, v4badge),
			row('IPv6', s.wan6 || '未启用', s.wan6_on ? '已启用' : '未启用'),
			row(s.dns_auto ? 'DNS（自动获取）' : 'DNS', s.wan_dns || '—', '')
		]),
		E('div', { 'class': 'sk-netsep' }),
		E('div', { 'class': 'stitle' }, [ '🔌 网络接口状态' ]),
		E('div', { 'class': 'sk-ports-box' }, portBlocks)
	]);
}

function icoImg(n) {
	return E('img', { 'class': 'sk-ico', 'src': '/luci-static/sakura-home/icon/' + n + '.png', 'alt': '' });
}

function card(ico, title, big, pct, sub, barcls) {
	var head = [ E('div', { 'class': 'sk-title' }, [ icoImg(ico), title ]) ];
	var body = [];
	if (big !== null && big !== undefined)
		body.push(E('div', { 'class': 'sk-big' }, [ big ]));
	if (pct !== null && pct !== undefined) {
		var w = Math.max(0, Math.min(100, pct));
		body.push(E('div', { 'class': 'sk-bar ' + (barcls || '') }, [
			E('i', { 'style': 'width:' + w.toFixed(1) + '%' })
		]));
	}
	if (sub) body.push(E('div', { 'class': 'sk-sub' }, [ sub ]));
	return E('div', { 'class': 'sk-card' }, head.concat(body));
}

function kvRow(k, v, dot) {
	var val = [];
	if (dot !== null && dot !== undefined)
		val.push(E('span', { 'class': 'sk-dot' + (dot ? ' ok' : '') }));
	val.push(v);
	return E('div', { 'class': 'r' }, [
		E('span', { 'class': 'k' }, [ k ]),
		E('span', { 'class': 'v' }, val)
	]);
}

return view.extend({
	render: function () {
		var wrap = E('div');

		function draw(s) {
			window.__sk_draw = draw;
			if (!s || typeof s !== 'object') return;
			var rows = [];

			/* 第一行：CPU / 内存 / 温度 */
			rows.push(E('div', { 'class': 'sk-grid g1' }, [
				card('cpu', 'CPU 使用率', pct(s.cpu_pct), s.cpu_pct,
					E('span', {}, [ E('b', {}, [ String(s.cpu_cores) ]), ' 核心 ｜ ' +
						(s.cpu_mhz ? (s.cpu_mhz / 1000).toFixed(1) + ' GHz' : '—') ]), 'pk'),
				card('mem', '内存使用率', pct(s.mem_pct), s.mem_pct,
					E('span', {}, [ '已用 ', E('b', {}, [ s.mem_used_s ]), ' / ' + s.mem_total_s ]), 'bl'),
				card('temp', '设备温度', s.temp_s, s.temp_pct,
					E('span', {}, [ s.temp != null ? '正常范围（0 - 85℃）' : '该设备未提供温度传感器' ]), 'rd')
			]));

			/* 第二行：网络状态 / 系统信息 / 接口状态 */
			var netCard = E('div', { 'class': 'sk-card' }, [
				E('div', { 'class': 'sk-title' }, [ icoImg('net'), '网络状态' ]),
				E('div', { 'class': 'sk-net' }, [
					E('div', {}, [ E('div', { 'class': 'v' }, [
						E('span', { 'class': 'arw up' }, [ '↑' ]),
						E('span', { 'class': 'num' }, [ s.net_ul_s ])
					]),
						E('div', { 'class': 'l' }, [ '上传速度' ]) ]),
					E('div', {}, [ E('div', { 'class': 'v' }, [
						E('span', { 'class': 'arw dn' }, [ '↓' ]),
						E('span', { 'class': 'num' }, [ s.net_dl_s ])
					]),
						E('div', { 'class': 'l' }, [ '下载速度' ]) ])
				])
			]);
			var chart = E('div');
			chart.innerHTML = '<svg class="sk-chart" viewBox="0 0 100 32" preserveAspectRatio="none">' +
				'<defs>' +
				'<linearGradient id="skgD" x1="0" y1="0" x2="0" y2="1">' +
				'<stop offset="0%" stop-color="#FF7FB6" stop-opacity="0.42"/>' +
				'<stop offset="100%" stop-color="#FF7FB6" stop-opacity="0.03"/></linearGradient>' +
				'<linearGradient id="skgU" x1="0" y1="0" x2="0" y2="1">' +
				'<stop offset="0%" stop-color="#8A7BE8" stop-opacity="0.38"/>' +
				'<stop offset="100%" stop-color="#8A7BE8" stop-opacity="0.03"/></linearGradient></defs>' +
				'<polygon points="0,32 ' + (s.poly || '') + ' 100,32" fill="url(#skgD)"/>' +
				'<polygon points="0,32 ' + (s.poly_ul || '') + ' 100,32" fill="url(#skgU)"/>' +
				'<polyline points="' + (s.poly || '') + '" fill="none" stroke="#FF5C9E" ' +
				'stroke-width="1.1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
				'<polyline points="' + (s.poly_ul || '') + '" fill="none" stroke="#7A6BE0" ' +
				'stroke-width="1.1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
			netCard.appendChild(chart);

			var sysCard = E('div', { 'class': 'sk-card' }, [
				E('div', { 'class': 'sk-title' }, [ icoImg('info'), '系统信息' ]),
				E('div', { 'class': 'sk-kv' }, [
					kvRow('主机名', s.hostname),
					kvRow('型号', s.model),
					kvRow('固件版本', shortFw(s.firmware)),
					kvRow('运行时间', s.uptime_s)
				])
			]);

			var ifRows = [];
			if (!s.interfaces || !s.interfaces.length) {
				ifRows.push(E('div', { 'class': 'r' }, [
					E('span', { 'class': 'k', 'style': 'flex:1;text-align:center' }, [ '未获取到接口信息' ])
				]));
			} else {
				for (var i = 0; i < s.interfaces.length; i++) {
					var it = s.interfaces[i];
					var name = it.label || it.name;
					var state = it.up ? (it.label === 'WAN' ? '已连接' : '运行中') : '未连接';
					ifRows.push(kvRow(name, state, it.up));
				}
			}
			var ifCard = E('div', { 'class': 'sk-card' }, [
				E('div', { 'class': 'sk-title' }, [ icoImg('if'), '接口状态' ]),
				E('div', { 'class': 'sk-kv' }, ifRows)
			]);

			rows.push(E('div', { 'class': 'sk-grid g2' }, [ netCard, sysCard, ifCard ]));

			var inner2 = [];
			if (window.__sk_wx) inner2.push(weatherCard(window.__sk_wx));
			inner2 = inner2.concat(rows);
			wrap.replaceChildren(E('div', { 'class': 'sk-wrap' }, [
				E('div', { 'class': 'sk-main' }, inner2),
				E('div', { 'class': 'sk-side' }, [ netInfoCard(s), disksCard(s) ]),
				devicesCard(s),
				trafficCard(s),
				dockerCard()
			]));
		}

		/* 时钟：每秒走 ✓ */
		if (!window.__sk_clock) {
			window.__sk_clock = setInterval(function () {
				var el = document.querySelector('.wclock');
				if (!el) return;
				var d = new Date();
				function pp(n) { return (n < 10 ? '0' : '') + n; }
				var t = pp(d.getHours()) + ':' + pp(d.getMinutes()) + ':' + pp(d.getSeconds());
				if (el.firstChild) el.firstChild.textContent = t;
			}, 1000);
		}

		/* Docker 容器：15 秒刷新一次 ✓ */
		poll.add(function () {
			return dockerLoad().then(function () {
				if (window.__sk_draw && window.__sk_st) window.__sk_draw(window.__sk_st);
			});
		}, 15);

		/* 天气：前 6 次快速轮询（等后台抓取 ✓），之后每分钟 ✓ */
		/* 状态数据每 3 秒刷新 ✓ */
		poll.add(function () {
			return callStatus().then(function (s) {
				if (s && typeof s === 'object') {
					s.mem_used_s = fmtSize(s.mem_used);
					s.mem_total_s = fmtSize(s.mem_total);
					s.temp_s = (s.temp != null) ? (Math.round(s.temp) + '℃') : '—';
					draw(s);
				}
			});
		}, 3);

		/* 只读看板：隐藏框架自动生成的 保存/应用/复位 按钮 ✓ */
		function hideActions() {
			var acts = document.querySelectorAll('.cbi-page-actions');
			for (var i = 0; i < acts.length; i++) acts[i].style.display = 'none';
		}
		hideActions();
		setTimeout(hideActions, 60);
		setTimeout(hideActions, 400);
		if (window.MutationObserver) {
			try {
				new MutationObserver(hideActions).observe(document.body, { childList: true, subtree: true });
			} catch (e) { }
		}

		dockerLoad();
		return callWeather().then(function (w) {
			if (w && typeof w === 'object') window.__sk_wx = w;
		}).then(function () { return callStatus(); }).then(function (s) {
			if (s && typeof s === 'object') {
				window.__sk_st = s;
				s.mem_used_s = fmtSize(s.mem_used);
				s.mem_total_s = fmtSize(s.mem_total);
				s.temp_s = (s.temp != null) ? (Math.round(s.temp) + '℃') : '—';
				draw(s);
			}
			return E([ E('style', {}, [ STYLE ]), wrap ]);
		});
	}
});

function fmtSize(kb) {
	var b = kb * 1024;
	if (b >= 1073741824) return (b / 1073741824).toFixed(1) + ' GB';
	if (b >= 1048576) return Math.round(b / 1048576) + ' MB';
	return Math.round(b / 1024) + ' KB';
}
