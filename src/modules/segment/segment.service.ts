import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { Segment } from './interface/segment.interface';
import { queries } from '@/queries';
import { NewSegmentDto } from './dto/newSegment.dto';
import { CreateSegmentError } from '@/common/errors/create_segment.error';

@Injectable()
export class SegmentService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getSegments(): Promise<Segment[]> {
    const segments = await this.db.query(queries.customer_segment.getSegments);
    return segments.rows;
  }

  async newSegment(segment: NewSegmentDto) {
    const { segment_name, segment_hierarchy } = segment;

    const newSeg = await this.db.query(queries.customer_segment.newSegments, [
      segment_name,
      segment_hierarchy,
    ]);

    if (newSeg.rowCount === 0) {
      throw new CreateSegmentError();
    }

    return { message: 'Segment created successfully' };
  }

  async deleteSegment(segmentId: number) {
    const deletedSeg = await this.db.query(
      queries.customer_segment.deleteSegment,
      [segmentId],
    );

    if (deletedSeg.rowCount === 0) {
      throw new InternalServerErrorException('Error deleting segment');
    }

    return { message: 'Segment deleted successfully' };
  }
}
