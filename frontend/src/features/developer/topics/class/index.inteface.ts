type InitialData = Record<string, unknown>;

interface IModule<T> {
  data: ObjectPro<T>;
}

type CompanyData = {
  header: string;
  subHeader: string;
  address?: string;
};

type PaymentData = {
  table: string[];
  title: string;
  currency?: string;
};

type BankData = {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
};

type CustomerTabs = {
  Company: CompanyData | null;
  Payment: PaymentData | null;
  Bank: BankData | null;
};

const initialCustomerData: CustomerTabs = {
  Company: null,
  Payment: null,
  Bank: null,
};

class ObjectPro<T> {
  private data: T;

  constructor(data: T) {
    this.data = data;
  }

  getData(): T {
    return this.data;
  }

  setData(data: T): void {
    this.data = data;
  }
}

class Module<T extends InitialData> implements IModule<T> {
  public data: ObjectPro<T>;

  constructor(data: T) {
    const object = new ObjectPro<T>(data);
    this.data = object;
  }

  getTabDetails<K extends keyof T>(tab: K): T[K] {
    return this.data.getData()[tab];
  }

  setTabDetails<K extends keyof T>(tab: K, details: T[K]): void {
    const currentData = this.data.getData();
    currentData[tab] = details;
    this.data.setData(currentData);
  }

  getAllTabs(): T {
    return this.data.getData();
  }

  setAllTabs(data: T): void {
    this.data.setData(data);
  }

  getTabKeys(): (keyof T)[] {
    return Object.keys(this.data.getData()) as (keyof T)[];
  }

  getTabDetailsByKey<K extends keyof T>(key: K): T[K] | null {
    return this.data.getData()[key] ?? null;
  }

  setTabDetailsByKey<K extends keyof T>(key: K, details: T[K]): void {
    const currentData = this.data.getData();
    currentData[key] = details;
    this.data.setData(currentData);
  }

  logData(): void {
    console.log('Module Data:', this.data);
  }
}

const customerModule = new Module<CustomerTabs>(initialCustomerData);

export { customerModule };
