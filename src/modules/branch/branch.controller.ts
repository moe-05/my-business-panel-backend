import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { BranchService } from './branch.service';
import { UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { CreateBranchDto } from '@/modules/branch/dto/create_branch.dto';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';

@UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get('/:id')
  @RequiredLevel(2)
  findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Get('/')
  @RequiredLevel(2)
  findAll(@Session() session: IUserSession) {
    return this.branchService.findByTenant(session.tenant_id);
  }

  @Post('/')
  @RequiredLevel(3)
  async createBranch(
    @Session() user: IUserSession,
    @Body() createBranchDto: CreateBranchDto,
  ) {
    return this.branchService.createBranch(user.tenant_id, createBranchDto);
  }
}
