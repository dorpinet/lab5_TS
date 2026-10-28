import type { Provider } from '@nestjs/common';
import { STORE_CONFIG, type StoreConfig } from './app-config.provider';

export const FEE_CALCULATOR = 'FEE_CALCULATOR';

export interface FeeCalculator {
  calculateTax(amount: number): number;
}

export const FeeCalculatorProvider: Provider = {
  provide: FEE_CALCULATOR,
  useFactory: (config: StoreConfig): FeeCalculator => ({
    calculateTax: (amount) => Math.round(amount * config.taxPercent) / 100,
  }),
  inject: [STORE_CONFIG],
};