import { DynamicModule, Module, Provider } from '@nestjs/common';
import Stripe from 'stripe';

@Module({})
export class StripeModule {
  static forRoot(
    apiKey: string,
    stripeConfig: Stripe.StripeConfig,
  ): DynamicModule {
    const stripe = new Stripe(apiKey, stripeConfig);

    const stripeProvider: Provider = {
      provide: 'STRIPE',
      useValue: stripe,
    };

    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
    };
  }
}
