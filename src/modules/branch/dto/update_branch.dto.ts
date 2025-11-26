import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from '@/modules/branch/dto/create_branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
