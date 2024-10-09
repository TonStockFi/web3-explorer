import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "../../../hooks/translation";
import { hexToRGBA } from "../../../libs/css";
import {isDesktop} from "../../../libs/common"
import { AppRoute } from "../../../libs/routes";
import { AppsIcon, TelegramIcon } from "../../Icon";
import { Label2 } from "../../Text";
import { AsideMenuItem } from "../../shared/AsideItem";
import PhonelinkRingIcon from "@mui/icons-material/PhonelinkRing";

const WalletAsideContainer = styled.div`
    padding: 0.5rem;
    width: fit-content;
    border-right: 1px solid ${p => p.theme.backgroundContentAttention};
    background: ${p => hexToRGBA(p.theme.backgroundContent, 0.56)};

    > a {
        text-decoration: unset;
        color: unset;
    }

    * {
        user-select: none;
    }
`;

const AsideMenuItemStyled = styled(AsideMenuItem)`
    background: ${p => (p.isSelected ? p.theme.backgroundContentTint : "unset")};
    padding-right: 50px;

    > svg {
        color: ${p => p.theme.iconSecondary};
    }
`;

export const DeviceAsideMenu = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isOpened = location.pathname.startsWith(AppRoute.connect_apps) || !(
    location.pathname.startsWith(AppRoute.tgSite) ||
    location.pathname.startsWith(AppRoute.device)
  );

  return (
    <WalletAsideContainer>
      <NavLink to={AppRoute.connect_apps}>
        {({ isActive }) => (
          <AsideMenuItemStyled isSelected={isActive || isOpened}>
            <AppsIcon />
            <Label2>{t("settings_connected_apps")}</Label2>
          </AsideMenuItemStyled>
        )}
      </NavLink>
      {
        isDesktop() && <NavLink to={AppRoute.tgSite}>
          {({ isActive }) => (
            <AsideMenuItemStyled isSelected={isActive}>
              <TelegramIcon />
              <Label2>{t("TelegramSite")}</Label2>
            </AsideMenuItemStyled>
          )}
        </NavLink>
      }
      <NavLink to={AppRoute.device}>
        {({ isActive }) => (
          <AsideMenuItemStyled isSelected={isActive}>
            <PhonelinkRingIcon fontSize={"small"} />
            <Label2>{t("MobileDevice")}</Label2>
          </AsideMenuItemStyled>
        )}
      </NavLink>
    </WalletAsideContainer>
  );
};
