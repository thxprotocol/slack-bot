import view from './view';
import listener from './listener';
import { EMOJI_ADD } from './utils';

export default {
  name: EMOJI_ADD,
  view,
  listener,
  buildView(data: any) {
    return {
      ...view,
      ...data,
    };
  },
};
