import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { ContractDto } from '../employee/dto/newEmployeeDto.dto';
import { queries } from '@/queries';
import { Contract } from '../employee/interface/employee.interface';

@Injectable()
export class ContractService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async updateContract(contract_id: string, data: ContractDto) {
    const existingContract = await this.db.query(queries.contract.byId, [
      contract_id,
    ]);

    if (existingContract.rows.length === 0) {
      throw new Error(`Contract with id ${contract_id} not found.`);
    }

    const { start_date, end_date, hours, base_salary, duties } = data;

    const updatedContract = await this.db.query(queries.contract.update, [
      start_date,
      end_date,
      hours,
      base_salary,
      duties,
      contract_id,
    ]);

    return {
      message: 'Contract updated successfully',
      contract: updatedContract.rows[0],
    };
  }

  async getContractById(contract_id: string): Promise<Contract | null> {
    const contract = await this.db.query(queries.contract.byId, [contract_id]);
    if (contract.rows.length === 0) return null;
    return contract.rows[0];
  }
}
