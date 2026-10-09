#
# LuCI Sakura Home Dashboard
#
include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Sakura Home Dashboard
LUCI_DESCRIPTION:=Sakura-style home dashboard: CPU, memory, temperature, network, system info, disks, clients, traffic and Docker containers. Optional: bandix (per-device traffic), docker (container card).
LUCI_DEPENDS:=+luci-theme-sakura +jsonfilter +ucode +uclient-fetch
PKG_VERSION:=1.0.0
PKG_RELEASE:=20261009

include $(TOPDIR)/feeds/luci/luci.mk

# ---------------------------------------------------------------------------
# 可选依赖（soft dependency）：刻意不写入 LUCI_DEPENDS
#   装了对应功能增强；不装也能正常使用，相关卡片会自动给出提示 ✓
#
#   bandix  —— 首页「流量使用情况」卡片的数据源（每设备 日/周/月 滚动累计）
#              未安装 → 该卡片直接提示「未安装 bandix 插件」
#              安装   → opkg install bandix
#   docker  —— Docker 容器卡片
#              未安装 → 该卡片提示「Docker 服务未运行」
#
# 说明：opkg 无 Recommends 自动安装机制，故可选依赖只做声明与文档，不强制拉取。
# ---------------------------------------------------------------------------

# call BuildPackage - OpenWrt buildroot signature