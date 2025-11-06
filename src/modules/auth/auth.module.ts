import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { UserModule } from '@/modules/user/user.module';
import { StateService } from '@/modules/state/state.service';
import { StateModule } from '../state/state.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [StateService],
      useFactory: async (stateService: StateService) => {
        await stateService.waitForInitialization();
        return {
          secret: stateService.getConstant<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: stateService.getConstant('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
    UserModule,
    StateModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
