import * as path from 'path';
import { EventEmitter } from 'events';

import { FileMatcher } from 'file-matcher';

export class GenericConfig extends EventEmitter {
  constructor() {
    super();
  }

  async _findFiles(fileNamePattern) {
    let options = {
      path: path.resolve('./'),
      recursiveSearch: true,
      fileFilter: { fileNamePattern }
    };

    let fileMatcher = new FileMatcher();
    return await fileMatcher.find(options);
  }
}
