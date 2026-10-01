/** HTTPS for the disposable WebKit preview; no production configuration changes. */
import {readFileSync} from 'node:fs';
export default {
  base: '/one-decision-away/',
  preview: {
    https: {
      key: readFileSync(process.env.ODA_WEBKIT_PREVIEW_KEY),
      cert: readFileSync(process.env.ODA_WEBKIT_PREVIEW_CERT),
    },
  },
};
