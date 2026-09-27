# luci-app-sakura-home

🌸 **樱花主题风格的 LuCI 首页看板插件**（ImmortalWrt / OpenWrt）

给软路由做一个漂亮的首页：把 CPU、内存、温度、网络、磁盘、设备、流量、Docker 全部集中到一个页面。

---

## ✨ 功能

### 📐 布局
4 列 CSS Grid × 8 列网格，右栏竖卡跨行对齐

| 卡片 | 内容 |
|---|---|
| 🌦️ **天气大卡** | 国内 IP 定位 ✓ 动态天空（按真实时刻变化）✓ 天气粒子动画 ✓ 实时时钟 ✓ |
| **CPU / 内存 / 温度** | 实时数据 ✓ 三色进度条（少女粉 / 天空蓝 / 红）✓ |
| **网络状态** | 上下行**双折线图** ✓ 实时速率 ✓ |
| **系统信息** | 主机名 / 型号 / 固件版本 / 运行时间 |
| **接口状态** | 各接口状态 + 在线圆点 |
| 🌐 **网络连接和 IP** | 连接状态 + 在线时长 + IPv4/IPv6/DNS + **网口横向滑动** ✓ |
| 💾 **磁盘存储** | 各挂载点用量条（超 85% 变红）✓ 可滚动 |
| 📱 **在线设备** | 设备名 / IP / 在线状态 三列 ✓ 可滚动 |
| 📊 **流量使用** | 按设备统计上下行（nlbwmon 今日累计 / conntrack 兜底）|
| 🐳 **Docker** | 服务开关 ✓ 容器列表（镜像/端口/挂载/网络）✓ 启停/重启 ✓ |

### 🎨 主题联动
- 主色调 / 透明度 / **模糊半径** 全部跟随樱花主题设置 ✓
- 深浅色天空自动切换文字颜色 ✓

---

## 📦 安装

```sh
# 编译
make package/luci-app-sakura-home/compile V=s

# 安装
opkg install luci-app-sakura-home_*.ipk
```

或把源码放进 `package/` 后 `make menuconfig` 勾选：
```
LuCI ---> Applications ---> <*> luci-app-sakura-home
```

---

## 🔧 依赖

| 包 | 用途 |
|---|---|
| `luci-theme-sakura` | 主题联动 |
| `jsonfilter` | 天气脚本解析 JSON |
| `ucode` | rpcd 后端 |
| `nlbwmon`（可选）| 按设备流量统计 |

---

## 📁 结构

```
luci-app-sakura-home/
├── Makefile
├── htdocs/luci-static/resources/view/sakura-home.js   # 前端
├── htdocs/luci-static/sakura-home/icon/*.png          # AI 生成图标
├── root/usr/bin/sakura-weather-fetch                  # 天气/流量/磁盘抓取
├── root/usr/libexec/rpcd/luci.sakura_home             # 数据后端（ucode）
├── root/usr/libexec/rpcd/luci.sakura_docker           # Docker 控制（shell）
├── root/etc/uci-defaults/50-sakura-home               # cron 安装
└── root/usr/share/{luci/menu.d,rpcd/acl.d}/           # 菜单 + 权限
```

---

## ⚙️ 工作原理

```
cron（每分钟）
  └─ sakura-weather-fetch
       ├─ 天气：国内 IP 源 + open-meteo → /tmp/sakura_weather.cache
       ├─ 磁盘：df → /tmp/sakura_disks.cache
       ├─ 流量：nlbwmon → /tmp/sakura_dev_traffic.cache
       └─ WAN 累计流量

rpcd 后端（luci.sakura_home）
  └─ 读缓存 + /proc/* → 前端每 3 秒轮询

Docker 控制（luci.sakura_docker，shell 版）
  └─ 直接调 docker CLI ✓（不受 rpcd 沙箱限制）
```

---

## 📌 说明

- 代码由 **AI 辅助生成**，经人工测试调整
- 图标由 AI 图像模型生成
- 基于 `luci-theme-sakura` 主题配套

---

## 📄 许可

Apache License 2.0
