import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve(import.meta.dirname, 'src');

const out = path.resolve(import.meta.dirname, 'dist');

fs.rmSync(out, { recursive: true, force: true });

fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(src)) {
  const { name, ext } = path.parse(file);

  const input = path.join(src, file);

  const output = path.join(out, `${name}.svg`);

  switch (ext) {
    case '.svg': {
      fs.copyFileSync(input, output);
      break;
    }
    case '.png': {
      const png = fs.readFileSync(input);

      // PNG IHDR chunk: width is big-endian uint32 at offsets 16
      const width = png.readUInt32BE(16);

      // PNG IHDR chunk: height is big-endian uint32 at offsets 20
      const height = png.readUInt32BE(20);

      fs.writeFileSync(
        output,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><image href="data:image/png;base64,${png.toString('base64')}" width="${width}" height="${height}"/></svg>`,
      );
      break;
    }
  }
}
