import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v2.8.4/types.ts";
import { ActionData } from "../@ddu-kinds/man.ts";

type Params = Record<never, never>;

async function getOutput(
  cmds: string[],
  cwd?: string,
): Promise<string[]> {
  try {
    const proc = Deno.run({
      cmd: cmds,
      stdout: "piped",
      stderr: "piped",
      cwd: cwd,
    });
    const [status, stdout, stderr] = await Promise.all([
      proc.status(),
      proc.output(),
      proc.stderrOutput(),
    ]);
    proc.close();

    if (!status.success) {
      console.error(new TextDecoder().decode(stderr));
      return [];
    }
    return (new TextDecoder().decode(stdout)).split("\n");
  } catch (e: unknown) {
    console.error(e);
    return [];
  }
}

export class Source extends BaseSource<Params> {
  kind = "man";

  gather(): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const items: Item<ActionData>[] = [];

        try {
          const lines = await getOutput(["apropos", ""]);
          for (const line of lines) {
            if (!line.length) {
              continue;
            }
            const m = line.match(/^\s*(\S+)\s\((\d)\)/);
            if (!m) {
              continue;
            }
            const [_, page, section] = m;
            items.push({
              word: `${page} ${section}`,
              display: line,
              highlights: [{
                name: "ddu_man",
                "hl_group": "Statement",
                col: 1,
                width: page.length,
              }],
              action: {
                page,
                section,
              },
            });
          }
          controller.enqueue(items);
        } catch (e) {
          console.error(e);
        }
        controller.close();
      },
    });
  }

  params(): Params {
    return {};
  }
}
