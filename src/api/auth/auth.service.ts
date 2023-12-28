import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/api/users/users.service';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async signIn(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findUserByEmail(email);
        if (user?.password !== pass) {
          throw new UnauthorizedException();
        }
        const payload = { id: user._id, email: user.email };
        return {
            token: await this.jwtService.signAsync(payload),
        };
      }
}
