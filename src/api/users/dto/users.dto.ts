import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";


export class UserRegisterDto
{
  @ApiProperty({
    type: String,
    default: "firstName"
  })
  readonly firstName: string;

  @ApiProperty({
    type: String,
    default: "lastName"
  })
  readonly lastName: string;

  @ApiProperty({
    type: String,
    default: "email"
  })
  @IsString() @IsNotEmpty()
  readonly email: string;
  
  @ApiProperty({
    type: String,
    default: "countryCode"
  })
  readonly countryCode: string;

  @ApiProperty({
    type: String,
    default: "phone"
  })
  readonly phone: string;

  @ApiProperty({
    type: String,
    default: "password"
  })
  @IsString() @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    type: String,
    default: {
        type: "Point",
        coordinates: [0,0]
    }
  })
  readonly location: string;

  @ApiProperty({
    type: String,
    default: "address"
  })
  readonly address: string;

  @ApiProperty({
    type: String,
    default: "profileImage"
  })
  readonly profileImage: string;

  @ApiProperty({
    type: String,
    default: "admin / provider / receiver"
  })
  @IsString() @IsNotEmpty()
  readonly userType: string;
}


export class UserLoginDto
{
  @ApiProperty({
    type: String,
    default: "email"
  })
  @IsString() @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    type: String,
    default: "password"
  })
  @IsString() @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    type: String,
    default: "admin / provider / receiver"
  })
  @IsString() @IsNotEmpty()
  readonly userType: string;
}

export class ChangePasswordDto
{
  @ApiProperty({
    type: String,
    default: "oldPassword"
  })
  @IsString() @IsNotEmpty()
  readonly oldPassword: string;

  @ApiProperty({
    type: String,
    default: "newPassword"
  })
  @IsString() @IsNotEmpty()
  readonly newPassword: string;
}