import HomeIcon from '@mui/icons-material/Home';
import ErrorIcon from '@mui/icons-material/Error';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const mapperObject = {
  HomeIcon: HomeIcon,
  ErrorIcon: ErrorIcon,
  ExtensionIcon: ExtensionIcon,
  AccountBoxIcon: AccountBoxIcon,
};

type MapperObjectKey = keyof typeof mapperObject;

const mappedIcons = (icon: string) => {
  if (icon && icon in mapperObject) {
    return mapperObject[icon as MapperObjectKey];
  }
  return ExtensionIcon;
};

export default mappedIcons;
