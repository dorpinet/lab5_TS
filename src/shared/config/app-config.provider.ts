import type { Provider } from '@nestjs/common';

export const STORE_CONFIG = 'STORE_CONFIG';

export interface StoreConfig {
  storeName: string;
  defaultCurrency: string;
  taxPercent: number;
}

export const StoreConfigProvider: Provider = {
  provide: STORE_CONFIG,
  useValue: {
    storeName: 'Book Haven',
    defaultCurrency: 'UAH',
    taxPercent: 20,
  } satisfies StoreConfig,
};