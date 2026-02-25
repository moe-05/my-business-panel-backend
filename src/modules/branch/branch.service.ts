import Database from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/modules/db/db.provider';
import { Branch } from '@/modules/branch/interfaces/branch.interface';
import { CreateBranchDto } from '@/modules/branch/dto/create_branch.dto';
import { UpdateBranchDto } from '@/modules/branch/dto/update_branch.dto';
import { queries } from '@/queries';
import { InvalidBranchError } from '@/common/errors/invalid_branch.error';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';
import { StateService } from '@/modules/state/state.service';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';

@Injectable()
export class BranchService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
  ) {}

  async findById(branchId: string): Promise<Branch> {
    const { rows } = await this.db.query(queries.branch.byId, [branchId]);
    return rows[0];
  }

  async findByTenant(tenantId: string): Promise<Branch[]> {
    const { rows } = await this.db.query(queries.branch.byTenant, [tenantId]);
    return rows;
  }

  async findBranchByName(branchName: string): Promise<Branch> {
    const { rows } = await this.db.query(queries.branch.byName, [branchName]);
    return rows[0];
  }

  async createBranch(
    user_tenant_id: string,
    createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    const { tenant_id, branch_name, branch_number, address, contact_email, is_main_branch } =
      createBranchDto;

    if (user_tenant_id !== tenant_id)
      throw new InvalidSessionError('UNAUTHORIZED');

    const { rows } = await this.db.query(queries.branch.create, [
      tenant_id,
      branch_name,
      branch_number,
      address || null,
      contact_email || null,
      is_main_branch,
    ]);

    return rows[0];
  }

  async deleteBranch(branchId: string): Promise<Branch> {
    const { rows } = await this.db.query(queries.branch.delete, [branchId]);
    return rows[0];
  }

  async updateBranch(
    branch_id: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<Branch> {
    const { branch_name, branch_number, address, contact_email, is_main_branch } =
      updateBranchDto;

    await this.validateBranch(branch_id);

    const { rows } = await this.db.query(queries.branch.update, [
      branch_id,
      branch_name,
      branch_number,
      address || null,
      contact_email || null,
      is_main_branch,
    ]);

    return rows[0];
  }

  async validateBranch(branchId: string, tenantId?: string): Promise<void> {
    const branch = await this.findById(branchId);
    if (!branch) throw new InvalidBranchError();
    if (tenantId && branch.tenant_id !== tenantId)
      throw new InvalidTenantError(tenantId);
  }
}
