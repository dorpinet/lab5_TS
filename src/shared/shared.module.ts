import { Module } from '@nestjs/common';
import { StoreConfigProvider, STORE_CONFIG } from './config/app-config.provider';
import { FeeCalculatorProvider, FEE_CALCULATOR } from './config/fee-calculator.provider';
import { SlugService } from './slug/slug.service';

@Module({
  providers: [SlugService, StoreConfigProvider, FeeCalculatorProvider],
  exports: [SlugService, STORE_CONFIG, FEE_CALCULATOR],
})
export class SharedModule {}