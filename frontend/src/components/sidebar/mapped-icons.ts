import HomeIcon from '@mui/icons-material/Home';
import ErrorIcon from '@mui/icons-material/Error';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BadgeIcon from '@mui/icons-material/Badge';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuizIcon from '@mui/icons-material/Quiz';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RateReviewIcon from '@mui/icons-material/RateReview';

const mapperObject = {
  HomeIcon: HomeIcon,
  ErrorIcon: ErrorIcon,
  ExtensionIcon: ExtensionIcon,
  AccountBoxIcon: AccountBoxIcon,
  GroupIcon: GroupIcon,
  ReceiptLongIcon: ReceiptLongIcon,
  BadgeIcon: BadgeIcon,
  InventoryIcon: InventoryIcon,
  EventIcon: EventIcon,
  DashboardIcon: DashboardIcon,
  CalendarMonthIcon: CalendarMonthIcon,
  QuizIcon: QuizIcon,
  MedicalServicesIcon: MedicalServicesIcon,
  PsychologyIcon: PsychologyIcon,
  ShoppingCartIcon: ShoppingCartIcon,
  UploadFileIcon: UploadFileIcon,
  RateReviewIcon: RateReviewIcon,
};

export type MapperObjectKey = keyof typeof mapperObject;

const mappedIcons = (icon: string) => {
  if (icon && icon in mapperObject) {
    return mapperObject[icon as MapperObjectKey];
  }
  return ExtensionIcon;
};

export default mappedIcons;
