import {
  BaseKind,
  DduItem,
  Previewer,
} from "https://deno.land/x/ddu_vim@v1.6.0/types.ts";

export type ActionData = {
  page: string;
  section: string;
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
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
