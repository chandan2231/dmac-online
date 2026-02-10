// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Window<T = any> {
  paypal: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UniversalType = any;

interface NetworkInformation {
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
}

interface NavigatorWithExtensions extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
}
