import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private authService: AuthService, private configService: ConfigService)
  {
    const headerKeyApiKey = "key";

    super({ header: headerKeyApiKey, prefix: '' }, true, async (apiKey: any, done: any) =>
    {
      if (this.authService.validateApiKey(apiKey))
      {
        done(null, true);
      }
      done(new UnauthorizedException({
        status: 401,
        message: 'Unauthorized User',
      }), null);
    });
  }
}
