import DeepCopyConfig from "./config.interface";

export default {
  default: {
    excludeFromCopy: ['admin::user'],
    contentTypes: {}
  } as DeepCopyConfig,
  validator() {},
};
