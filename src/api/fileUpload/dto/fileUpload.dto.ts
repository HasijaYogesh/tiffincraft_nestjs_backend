import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileQueryDto
{
  @ApiProperty({
    description: 'Enter the file name if want to delete',
    required: false,
    default: "search"
  })
  @IsOptional()
  public previousFile: string = "previousFile";
}


export class DeleteFileDto
{
    @ApiProperty({
        type: [String],
        default: ["fileNames"]
      })
    readonly fileNames: [string];
}


export class DownloadFileDto
{
    @ApiProperty({
        type: String,
        default: "fileName"
      })
    readonly fileName: string;
}