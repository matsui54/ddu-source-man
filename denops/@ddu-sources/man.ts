import { type Item } from "jsr:@shougo/ddu-vim@~10.4.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~10.4.0/source";
import { ActionData } from "../@ddu-kinds/man.ts";

type Params = Record<never, never>;

async function getOutput(
  cmds: string[],
  cwd?: string,
): Promise<string[]> {
  try {
    const command = new Deno.Command(
      cmds[0],
      {
        args: cmds.slice(1),
        stdout: "piped",
        stderr: "piped",
        cwd: cwd,
      },
    );
    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
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
  override kind = "man";

  override gather(): ReadableStream<Item<ActionData>[]> {
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

  override params(): Params {
    return {};
  }
}
