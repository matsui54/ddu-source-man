import {
  type ActionArguments,
  ActionFlags,
  DduItem,
  Previewer,
} from "jsr:@shougo/ddu-vim@~10.4.0/types";
import { BaseKind } from "jsr:@shougo/ddu-vim@~10.4.0/kind";

export type ActionData = {
  page: string;
  section: string;
};

type OpenParams = {
  command: string;
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  override actions = {
    open: async ({
      denops,
      actionParams,
      items,
    }: ActionArguments<Params>) => {
      const params = actionParams as OpenParams;
      // Convert sp[lit], vs[plit] tabe[dit] -> "vertical", "", "tab"
      const openCommand = (params.command ?? "").replace(
        /^vs(?:p(?:l(?:i(?:t)?)?)?)?$/,
        "vertical",
      ).replace(
        /^s(?:p(?:l(?:i(?:t)?)?)?)?$/,
        "",
      ).replace(
        /^tabe(?:d(?:i(?:t?)?)?)?$/,
        "tab",
      );

      const action = items[0]?.action as ActionData;
      try {
        await denops.cmd(`${openCommand} Man ${action.section} ${action.page}`);
      } catch (e) {
        console.error(e);
      }
      return Promise.resolve(ActionFlags.None);
    },
  };

  override getPreviewer(args: {
    item: DduItem;
  }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData;
    if (!action || !action.page) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      kind: "terminal",
      cmds: ["man", action.section, action.page],
    });
  }

  params(): Params {
    return {};
  }
}
