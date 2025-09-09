import HomeIcon from '@mui/icons-material/Home';
import ErrorIcon from '@mui/icons-material/Error';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BadgeIcon from '@mui/icons-material/Badge';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';

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
};

export type MapperObjectKey = keyof typeof mapperObject;

const mappedIcons = (icon: string) => {
  if (icon && icon in mapperObject) {
    return mapperObject[icon as MapperObjectKey];
  }
  return ExtensionIcon;
};

export default mappedIcons;
