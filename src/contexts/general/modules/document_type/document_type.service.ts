import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from './interface/document_type.interface';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';

@Injectable()
export class DocumentTypeService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
  //Delete this when the database is implemented

  async getAll(): Promise<DocumentType[]> {
    const { rows } = await this.db.query(queries.document_type.all);
    return rows;
  }

  /**
   * Gets a document type by its ID
   * @param id: string
   * @returns: DocumentType | undefined
   */
  async getById(id: string): Promise<DocumentType> {
    const { rows } = await this.db.query(queries.document_type.byId, [id]);
    return rows[0];
  }

  async delete(id: string) {
    const { rows } = await this.db.query(queries.document_type.delete, [id]);
    return {
      message: `Document type with ID ${rows[0].document_type_id} deleted successfully`,
    };
  }
}
