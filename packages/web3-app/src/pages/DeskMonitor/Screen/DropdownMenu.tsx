import * as React from "react";
import Menu from "@web3-explorer/uikit-mui/dist/mui/Menu";
import MenuItem from "@web3-explorer/uikit-mui/dist/mui/MenuItem";
import Fade from "@web3-explorer/uikit-mui/dist/mui/Fade";
import IconButton from "@web3-explorer/uikit-mui/dist/mui/IconButton";
import ListItemIcon from "@web3-explorer/uikit-mui/dist/mui/ListItemIcon";
import Divider from "@web3-explorer/uikit-mui/dist/mui/Divider";
import { useTranslation } from "@tonkeeper/uikit/dist/hooks/translation";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { View } from "@web3-explorer/uikit-view";
import { DeviceOptions, GLOBAL_ACTIONS, WsCloseCode } from "../types";
import { wsSendClientEventAction, wsSendClose, wsSendMessage } from "../../../common/ws";
import PhonelinkEraseIcon from "@mui/icons-material/PhonelinkErase";
import DeleteIcon from "@mui/icons-material/Delete";
import { Devices } from "../global";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import HomeIcon from "@mui/icons-material/Home";
import GridViewIcon from "@mui/icons-material/GridView";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import { slotProps } from "./DropdownMenuWebview";

export default function DropdownMenu({ deviceOptions }: { deviceOptions: DeviceOptions }) {
  const { t } = useTranslation();

  const [disconnectConfirm, setDisconnectConfirm] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const {
    ws,
    setIsInfoPanel,
    setIsCutEnable,
    setIsSettingPanel,
    isLogged,
    isAdding,
    isCutEnable,
    setGlobalUpdatedAt
  } = deviceOptions;
  const inputIsOpen = deviceOptions.getDeviceInfo("inputIsOpen", false);
  if (isAdding) {
    return null;
  }

  return (
    <View>
      <View
        prompt={{
          open: !!prompt,
          title: prompt,
          onClose: () => {
            setPrompt("");
          },
          onConfirm: async (value: string) => {
            if (value.length === 0) {
              return false;
            }
            const device = Devices.get(deviceOptions.deviceId)!;
            device.name = value;
            Devices.set(deviceOptions.deviceId, device);
            const devicesArray = Array.from(Devices.entries());
            localStorage.setItem("Devices", JSON.stringify(devicesArray));
            if (deviceOptions.ws) {
              wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, "remove device", deviceOptions.ws);
            }
            if (deviceOptions.setGlobalUpdatedAt) {
              deviceOptions.setGlobalUpdatedAt(+new Date());
            }
            setPrompt("");
            return true;
          }
        }}
      />
      <View
        confirm={{
          id: "disconnect_confirm",
          content: "确认断开连接？",
          open: disconnectConfirm,
          onConfirm: async () => {
            localStorage.setItem("disconnect_" + deviceOptions.deviceId, "1");
            wsSendMessage(
              {
                action: "close",
                payload: {
                  code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                  reason: "WS_CLOSE_STOP_RECONNECT"
                }
              },
              deviceOptions.ws
            );
            setDisconnectConfirm(false);
          },
          onCancel: () => setDisconnectConfirm(false)
        }}
      />
      <View
        confirm={{
          id: "delete_confirm",
          content: "确认删除？",
          open: deleteConfirm,
          onConfirm: async () => {
            wsSendMessage(
              {
                action: "close",
                payload: {
                  code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                  reason: "WS_CLOSE_STOP_RECONNECT"
                }
              },
              deviceOptions.ws
            );
            Devices.delete(deviceOptions.deviceId);
            const devicesArray = Array.from(Devices.entries());
            localStorage.setItem("Devices", JSON.stringify(devicesArray));
            setGlobalUpdatedAt && setGlobalUpdatedAt(+new Date());
            setDeleteConfirm(false);
          },
          onCancel: () => setDeleteConfirm(false)
        }}
      />
      <IconButton
        size={"small"}
        onClick={handleClick}
        edge="start"
        color="inherit"
        aria-label="menu"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        slotProps={slotProps}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button"
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <View empty hide={!inputIsOpen || !isLogged}>
          <MenuItem
            onClick={async () => {
              wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_BACK, ws);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <ArrowCircleLeftIcon />
            </ListItemIcon>
            后退
          </MenuItem>
        </View>
        <View empty hide={!inputIsOpen || !isLogged}>
          <MenuItem
            onClick={async () => {
              wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_HOME, ws);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            主页
          </MenuItem>
        </View>
        <View empty hide={!inputIsOpen || !isLogged}>
          <MenuItem
            onClick={async () => {
              wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_RECENTS, ws);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <GridViewIcon />
            </ListItemIcon>
            最近打开
          </MenuItem>
          <Divider />
        </View>

        <View empty hide={isAdding || !isLogged}>
          <MenuItem
            onClick={async () => {
              setIsCutEnable(true);
              setIsInfoPanel && setIsInfoPanel(false);
              setIsSettingPanel && setIsSettingPanel(false);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <HighlightAltIcon />
            </ListItemIcon>
            屏幕截取
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setPrompt("修改设备名");
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            修改设备名
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setIsCutEnable(false);
              setIsSettingPanel && setIsSettingPanel(true);
              setIsInfoPanel && setIsInfoPanel(false);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            设置
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setIsCutEnable(false);
              setIsInfoPanel && setIsInfoPanel(true);
              setIsSettingPanel && setIsSettingPanel(false);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            设备信息
          </MenuItem>
          <Divider />
        </View>

        <View empty hide={!isLogged || isCutEnable}>
          <MenuItem
            onClick={() => {
              setDisconnectConfirm(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <PhonelinkEraseIcon />
            </ListItemIcon>
            {t("disconnect")}
          </MenuItem>
        </View>
        <View empty hide={isAdding || isCutEnable}>
          <MenuItem
            onClick={async () => {
              setDeleteConfirm(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DeleteIcon color={"error"} />
            </ListItemIcon>
            {t("delete")}
          </MenuItem>
        </View>
      </Menu>
    </View>
  );
}
