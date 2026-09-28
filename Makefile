#
# LuCI Sakura Home Dashboard
#
include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Sakura Home Dashboard
LUCI_DESCRIPTION:=Sakura-style home dashboard: CPU, memory, temperature, network, system info, disks, clients, traffic and Docker containers. Optional: nlbwmon (per-device traffic), docker (container card).
LUCI_DEPENDS:=+luci-theme-sakura +jsonfilter +ucode +uclient-fetch
PKG_VERSION:=1.0.0
PKG_RELEASE:=20260926

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
