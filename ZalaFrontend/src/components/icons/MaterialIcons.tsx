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
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CampaignIcon from "@mui/icons-material/Campaign";
import MapIcon from "@mui/icons-material/Map";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import PaidIcon from "@mui/icons-material/Paid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GroupsIcon from "@mui/icons-material/Groups";

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
    case Icons.Email:
      return (props: SvgIconProps) => <EmailIcon {...props} />;
    case Icons.Minus:
      return (props: SvgIconProps) => <RemoveCircleOutlineIcon {...props} />;
    case Icons.Close:
      return (props: SvgIconProps) => <HighlightOffIcon {...props} />;
    case Icons.Arrow:
      return (props: SvgIconProps) => <ArrowBackIcon {...props} />;
    case Icons.Back:
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
    case Icons.Kanban:
      return (props: SvgIconProps) => <ViewKanbanIcon {...props} />;
    case Icons.Add:
      return (props: SvgIconProps) => <AddIcon {...props} />;
    case Icons.Trash:
      return (props: SvgIconProps) => <DeleteForeverIcon {...props} />;
    case Icons.AddBox:
      return (props: SvgIconProps) => <LibraryAddIcon {...props} />;
    case Icons.Settings:
      return (props: SvgIconProps) => <SettingsIcon {...props} />;
    case Icons.Upload:
      return (props: SvgIconProps) => <UploadIcon {...props} />;
    case Icons.Edit:
      return (props: SvgIconProps) => <EditIcon {...props} />;
    case Icons.Dashboard:
      return (props: SvgIconProps) => <DashboardIcon {...props} />;
    case Icons.Notification:
      return (props: SvgIconProps) => <NotificationsIcon {...props} />;
    case Icons.Group:
      return (props: SvgIconProps) => <GroupsIcon {...props} />;
    case Icons.Check:
      return (props: SvgIconProps) => <CheckCircleIcon {...props} />;
    case Icons.Pending:
      return (props: SvgIconProps) => <PendingIcon {...props} />;
    case Icons.Announce:
      return (props: SvgIconProps) => <CampaignIcon {...props} />;
    case Icons.Map:
      return (props: SvgIconProps) => <MapIcon {...props} />;
    case Icons.File:
      return (props: SvgIconProps) => <AttachFileIcon {...props} />;
    case Icons.Image:
      return (props: SvgIconProps) => <ImageIcon {...props} />;
    case Icons.Coin:
      return (props: SvgIconProps) => <PaidIcon {...props} />;
    case Icons.ChevronLeft:
      return (props: SvgIconProps) => <ChevronLeftIcon {...props} />;
    case Icons.PropertyPin:
      return (props: SvgIconProps) => <LocationCityIcon {...props} />;
    case Icons.Leaderboard:
      return (props: SvgIconProps) => <LeaderboardIcon {...props} />;
    default:
      return null;
  }
};
