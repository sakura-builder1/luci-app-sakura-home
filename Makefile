#
# Sakura Home Dashboard for LuCI
#
include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Sakura Home Dashboard
LUCI_DESCRIPTION:=Sakura style home dashboard with CPU, memory, temperature, network, system info and interface status.
LUCI_DEPENDS:=+luci-theme-sakura +jsonfilter +ucode
PKG_VERSION:=1.0.0
PKG_RELEASE:=20260926

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
