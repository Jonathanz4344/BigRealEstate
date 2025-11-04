import { Icons } from "./IconsEnum";

import type { SvgIconProps } from "@mui/material/SvgIcon";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import PhoneIcon from "@mui/icons-material/Phone";
import TextsmsIcon from "@mui/icons-material/Textsms";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";

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
    case Icons.Arrow:
      return (props: SvgIconProps) => <ArrowBackIcon {...props} />;
    case Icons.CheckboxOutline:
      return (props: SvgIconProps) => <CheckBoxOutlineBlankIcon {...props} />;
    case Icons.CheckboxChecked:
      return (props: SvgIconProps) => <CheckBoxIcon {...props} />;
    case Icons.Phone:
      return (props: SvgIconProps) => <PhoneIcon {...props} />;
    case Icons.Txt:
      return (props: SvgIconProps) => <TextsmsIcon {...props} />;
    case Icons.Skip:
      return (props: SvgIconProps) => <SkipNextIcon {...props} />;
    case Icons.Chevron:
      return (props: SvgIconProps) => <ChevronRightIcon {...props} />;
    case Icons.Lock:
      return (props: SvgIconProps) => <LockIcon {...props} />;
    default:
      return null;
  }
};
