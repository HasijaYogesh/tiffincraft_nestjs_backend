import { Body, Controller, Post, HttpCode, HttpStatus, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/auth-dto';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ description: "Api for sign in user with email and password" })
  async signIn(@Body() reqData: SignInUserDto) {
    const { email, password } = reqData;
    return await this.authService.signIn(email, password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiOperation({ description: "Api for testing bearer token" })
  async profile(@Request() req: any) {
  console.log("req.user ==>>> " , req.user);
    return req.user;
  }
}