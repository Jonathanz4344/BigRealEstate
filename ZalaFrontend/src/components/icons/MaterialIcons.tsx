import { Icons } from "./IconsEnum";

import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import SearchIcon from "@mui/icons-material/Search";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuIcon from "@mui/icons-material/Menu";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import FlagIcon from "@mui/icons-material/Flag";
import EmailIcon from "@mui/icons-material/Email";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import type { SvgIconProps } from "@mui/material/SvgIcon";

export const getMaterialIcon = (iconName: Icons) => {
  switch (iconName) {
    case Icons.Home:
      return (props: SvgIconProps) => <HomeFilledIcon {...props} />;
    case Icons.Search:
      return (props: SvgIconProps) => <SearchIcon {...props} />;
    case Icons.Chart:
      return (props: SvgIconProps) => <InsertChartIcon {...props} />;
    case Icons.User:
      return (props: SvgIconProps) => <PersonIcon {...props} />;
    case Icons.Notes:
      return (props: SvgIconProps) => <DescriptionIcon {...props} />;
    case Icons.Menu:
      return (props: SvgIconProps) => <MenuIcon {...props} />;
    case Icons.UserPin:
      return (props: SvgIconProps) => <PersonPinCircleIcon {...props} />;
    case Icons.Connect:
      return (props: SvgIconProps) => <ConnectWithoutContactIcon {...props} />;
    case Icons.Flag:
      return (props: SvgIconProps) => <FlagIcon {...props} />;
    case Icons.Mail:
      return (props: SvgIconProps) => <EmailIcon {...props} />;
    case Icons.Minus:
      return (props: SvgIconProps) => <RemoveCircleOutlineIcon {...props} />;
    case Icons.Close:
      return (props: SvgIconProps) => <HighlightOffIcon {...props} />;
    default:
      return null;
  }
};
