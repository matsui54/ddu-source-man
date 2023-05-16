import {
  ActionArguments,
  ActionFlags,
  Actions,
  BaseKind,
  DduItem,
  Previewer,
} from "https://deno.land/x/ddu_vim@v2.8.4/types.ts";

export type ActionData = {
  page: string;
  section: string;
};

type OpenParams = {
  command: string;
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  actions: Actions<Params> = {
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

  getPreviewer(args: {
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
