import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { ClockInDto } from './dto/clockIn.dto';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeNotFoundError } from '@/common/errors/employee_not_found.error';
import { queries } from '@/queries';

@Injectable()
export class ClockingService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly employeeService: EmployeeService,
  ) {}

  async registerClockIn(data: ClockInDto) {
    const { employeeId, branchId } = data;

    const employee = await this.employeeService.getEmployeeById(employeeId);

    if (!employee) {
      throw new EmployeeNotFoundError(employeeId);
    }

    const clockInRecord = await this.db.query(queries.clocking.clock_in, [
      employeeId,
      branchId,
    ]);

    if (clockInRecord.rows.length === 0) {
      throw new Error('Failed to register clock-in. Check the provided data.');
    }

    return {
      message: 'Clock-in registered successfully',
      clockIn: clockInRecord.rows[0].clocking_id,
    };
  }

  async registerClockOut(employeeId: string) {
    const clockOutRecord = await this.db.query(queries.clocking.clock_out, [
      employeeId,
    ]);

    if (clockOutRecord.rows.length === 0) {
      throw new Error('Failed to register clock-out. Check the provided data.');
    }

    return {
      message: 'Clock-out registered successfully',
      clockOut: clockOutRecord.rows[0].clocking_id,
    };
  }
}
