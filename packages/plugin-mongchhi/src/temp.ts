import { fsExtra as fs } from '@umijs/utils';
import os from 'os';
import path from 'path';

const tempDir = path.join(os.homedir(), '.mongchhi');

class TempFileHelper<InitValue> {
  private file: string;
  private initValue: any;
  constructor(namespace: string, key: string, initValue?: any) {
    const dir = path.join(tempDir, '.' + namespace);
    this.file = path.join(dir, key + '.json');
    this.initValue = initValue;
    if (fs.existsSync(dir) === false) {
      fs.ensureDirSync(dir);
    }
  }

  get(): object | InitValue {
    if (fs.existsSync(this.file) === false) {
      return this.initValue;
    }
    const content = fs.readFileSync(this.file, 'utf-8');
    return this.parse(content);
  }

  set(value: any): void {
    fs.writeFileSync(this.file, JSON.stringify(value), 'utf-8');
  }

  update(updater: (value: any) => any): void {
    const oldValue = this.get();
    const newValue = updater(oldValue);
    this.set(newValue);
  }

  delete(): void {
    fs.unlinkSync(this.file);
  }

  private parse(content: string): object | InitValue {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error(e);
      return this.initValue;
    }
  }
}

const localUmiAppData = new TempFileHelper<object>('cache', 'localUmiAppData', {});

export { localUmiAppData };
