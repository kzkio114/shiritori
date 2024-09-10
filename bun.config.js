import path from 'path';
import fs from 'fs';

const config = {
  sourcemap: "external",
  entrypoints: ["app/javascript/application.js"],  // 主エントリポイント
  outdir: path.join(process.cwd(), "app/assets/builds"),  // 出力ディレクトリ
  loader: {
    ".js": "jsx",  // .js ファイルも JSX として解析
    ".jsx": "jsx",  // .jsx ファイルを JSX として解析
  },
};

const build = async (config) => {
  const result = await Bun.build(config);

  if (!result.success) {
    if (process.argv.includes('--watch')) {
      console.error("Build failed");
      for (const message of result.logs) {
        console.error(message);
      }
      return;
    } else {
      throw new AggregateError(result.logs, "Build failed");
    }
  }
};

(async () => {
  await build(config);

  if (process.argv.includes('--watch')) {
    fs.watch(path.join(process.cwd(), "app/javascript"), { recursive: true }, (eventType, filename) => {
      console.log(`File changed: ${filename}. Rebuilding...`);
      build(config);
    });
  } else {
    process.exit(0);
  }
})();
