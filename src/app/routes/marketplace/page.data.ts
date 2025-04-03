import { cookieUtils } from '@/ac-components/utils';
import { type LoaderFunction, json } from '@modern-js/runtime/router';

export const loader: LoaderFunction = async ({ request }) => {
  // In a real implementation, this would fetch plugins from an API
  // For now, we'll just return an empty object
  return json({});
};
