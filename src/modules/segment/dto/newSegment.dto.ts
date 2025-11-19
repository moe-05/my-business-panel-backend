import { IsNumber, IsString } from 'class-validator';

export class NewSegmentDto {
  @IsString()
  segment_name!: string;

  @IsNumber()
  segment_hierarchy!: number;
}
