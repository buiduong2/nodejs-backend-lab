import { SetMetadata } from '@nestjs/common';

export const CHECK_RESOURCE_ACCESS_KEY = 'check_resource_access';

export interface CheckResourceAccessOptions {
  resource: 'task',
  paramKey?: string;
//   isArray?: boolean;
//   targetUserParamKey?: string;
}

export const CheckResourceAccess = (
  options: CheckResourceAccessOptions | CheckResourceAccessOptions[],
) => SetMetadata(CHECK_RESOURCE_ACCESS_KEY, options);
