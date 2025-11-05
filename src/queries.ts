import { createQueries } from '@lodestar-official/database';

export const queries = createQueries({
  test: {
    all: 'SELECT * FROM test',
  },
});
