import view from './view';
import listener from './listener';
import { SETUP_ASSETPOOL } from './utils';

export default {
  name: SETUP_ASSETPOOL,
  view,
  listener,
  buildView(data: any) {
    return {
      ...view,
      ...data,
    };
  },
};
