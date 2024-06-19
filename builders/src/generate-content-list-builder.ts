import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { promises as fs } from 'fs';
import { join } from 'node:path';
import { parseMarkdownMeta } from './../../utils/parse-markdown-meta';

interface Options extends JsonObject {
  source: string;
  jsonFile: string;
  routesFile: string;
}

export default createBuilder(generateContentListBuilder);

async function generateContentListBuilder(
  options: Options,
  context: BuilderContext,
): Promise<BuilderOutput> {
  context.logger.info('📄 Generate content list json file');

  const { source, jsonFile, routesFile } = options;

  try {
    fs.watch(source);
    const items = await fs.readdir(options.source, { withFileTypes: true });

    const result = {
      contentList: await Promise.all(
        items
          .filter((item) => item.isDirectory())
          .map(async (item) => {
            const slug = item.name;
            const path = join(source, slug, `${slug}.md`);
            const fileContent = await fs.readFile(path, { encoding: 'utf-8' });
            const data = parseMarkdownMeta(fileContent, slug);
            return {
              slug: slug,
              title: data.title,
              date: data.date,
              summary: data.summary,
            };
          }),
      ),
    };

    fs.writeFile(jsonFile, JSON.stringify(result));
    fs.writeFile(
      routesFile,
      result.contentList.map((item) => item.slug).join('\n'),
    );
  } catch (err) {
    context.logger.error('Failed to generate content list.');
    return {
      success: false,
      error: (err as Error).message,
    };
  }

  context.logger.info('✅ Done');

  return { success: true };
}
