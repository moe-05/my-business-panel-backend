import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from './interface/document_type.interface';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';

@Injectable()
export class DocumentTypeService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
  //Delete this when the database is implemented

  async findAll(): Promise<DocumentType[]> {
    const query = await this.db.query(queries.document_type.all);
    return query.rows;
  }

  /**
   * Gets a document type by its ID
   * @param id: string
   * @returns: DocumentType | undefined
   */
  async findById(id: string): Promise<DocumentType> {
    const document = await this.db.query(queries.document_type.byId, [id]);
    return document.rows[0];
  }

  async delete(id: string) {
    const result = await this.db.query(queries.document_type.delete, [id]);
    return {
      message: `Document type with ID ${result.rows[0].document_type_id} deleted successfully`,
    };
  }
}
