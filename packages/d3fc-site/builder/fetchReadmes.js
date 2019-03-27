import fs from 'fs-promise';
import path from 'path';
import glob from 'glob';

const root = path.resolve(__dirname, '../../..');

const excludes = ['scripts'];
const readmeGlob = `packages/d3fc-!(${excludes.join('|')})/README.md`;

const getPackageName = (inputPath) =>
  path.parse(path.resolve(inputPath, '../')).name.replace('d3fc-', '') + '-api';

export default () =>
  new Promise((resolve, reject) => {
    glob(readmeGlob, { cwd: root }, (err, files) => {
      if (err) {
        console.error('Finding README\'s failed - ', err);
        reject(err);
      }

      const readPromises = files.map(filename => {
        const filepath = path.join(root, filename);
        return fs.readFile(filepath)
          .then(buffer => ({
            name: getPackageName(filepath),
            contents: buffer.toString()
          }));
      });

      return Promise
        .all(readPromises)
        .then(resolve)
        .catch(reject);
    });
  });
