import { Inject, Injectable } from '@nestjs/common';
import { queries } from '@/queries';
import Database from '@lodestar-official/database';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { DATABASE } from '@/modules/db/db.provider';
import { CreateCashRegisterDto } from '@/modules/cash_register/dto/create_cash_register.dto';
import { UpdateCashRegisterDto } from '@/modules/cash_register/dto/update_cash_register.dto';
import { StartCashRegisterSessionDto } from '@/modules/cash_register/dto/start_cash_register_session.dto';
import { CloseCashRegisterSessionDto } from '@/modules/cash_register/dto/close_cash_register_session.dto';
// import { RegisterTransactionDto } from '@/modules/cash_register/dto/register_transaction.dto';
import { InvalidCashRegisterError } from '@/common/errors/invalid_cash_register.error';
// import { InvalidBranchError } from '@/common/errors/invalid_branch.error';
import { CashRegister } from '@/modules/cash_register/interfaces/cash_register.interface';
import { CashRegisterSession } from '@/modules/cash_register/interfaces/cash_register_session.interface';
import { InvalidCashRegisterSessionError } from '@/common/errors/invalid_cash_register_session.error';

@Injectable()
export class CashRegisterService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(): Promise<{ results: CashRegister[] }> {
    const { rows } = await this.db.query(queries.cash_register.all, []);
    return { results: rows };
  }

  async findById(cash_register_id: string): Promise<{ result: CashRegister }> {
    const { rows } = await this.db.query(queries.cash_register.byId, [
      cash_register_id,
    ]);
    return { result: rows[0] };
  }

  async findByBranch(branch_id: string): Promise<{ results: CashRegister[] }> {
    // await this.checkBranchId(branch_id);
    const { rows } = await this.db.query(queries.cash_register.byBranch, [
      branch_id,
    ]);
    return { results: rows };
  }

  async create(createDto: CreateCashRegisterDto) {
    const { branch_id, is_active } = createDto;

    // await this.checkBranchId(branch_id);

    return await this.db.query(queries.cash_register.create, [
      branch_id,
      is_active,
    ]);
  }

  async startSession(
    session: IUserSession,
    startSessionDto: StartCashRegisterSessionDto,
  ) {
    const { user_id } = session;
    const { cash_register_id, opened_at, opening_amount } = startSessionDto;

    await this.checkCashRegisterId(cash_register_id);

    const { rows } = await this.db.query(queries.cash_register.startSession, [
      cash_register_id,
      opened_at,
      opening_amount,
      user_id,
    ]);

    return { started: rows[0] };
  }

  async closeSession(
    session: IUserSession,
    closeSession: CloseCashRegisterSessionDto,
  ) {
    const { user_id } = session;
    const { cash_register_session_id, closed_at, closing_amount } =
      closeSession;

    const cash_session = await this.getSession(cash_register_session_id);
    if (!cash_session.is_active) throw new InvalidCashRegisterSessionError();

    const { rows } = await this.db.query(queries.cash_register.closeSession, [
      closed_at,
      closing_amount,
      user_id,
      cash_register_session_id,
    ]);
    return { closed: rows[0] };
  }

  // async registerTransaction(transactionDto: RegisterTransactionDto) {}

  async update(updateDto: UpdateCashRegisterDto) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updateDto)) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    const query = `
      UPDATE pos_module.cash_register
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE cash_register_id = $${index}
      RETURNING *
    `;

    const { rows } = await this.db.query(query, values);
    return { updated: rows[0] };
  }

  async remove(cash_register_id: string) {
    const { rows } = await this.db.query(queries.cash_register.delete, [
      cash_register_id,
    ]);
    return { deleted: rows[0] };
  }

  private async checkCashRegisterId(cash_register_id: string): Promise<void> {
    const { rowCount } = await this.db.query(queries.cash_register.byId, [
      cash_register_id,
    ]);
    if (rowCount === 0)
      throw new InvalidCashRegisterError('Cash register not found');
  }

  // private async checkBranchId(branch_id: string): Promise<void> {
  //   const { rowCount } = await this.db.query(queries.branch.byId, [branch_id]);
  //   if (rowCount === 0) throw new InvalidBranchError();
  // }

  private async getSession(session_id: string): Promise<CashRegisterSession> {
    const { rows, rowCount } = await this.db.query(
      queries.cash_register.getSessionById,
      [session_id],
    );
    if (rowCount === 0)
      throw new InvalidCashRegisterError('Cash register session not found');
    return rows[0];
  }
}
