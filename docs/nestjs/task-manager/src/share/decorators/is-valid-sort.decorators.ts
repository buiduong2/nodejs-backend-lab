import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidSort(validationOptions?: ValidationOptions) {
  return function (proto: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSort',
      target: proto.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }

          const regex = /^[a-zA-Z][a-zA-Z0-9_]*(?:,(asc|desc))?$/i;

          return value.every(
            (sort) => typeof sort === 'string' && regex.test(sort),
          );
        },

        defaultMessage() {
          return 'sort must follow the format field,asc or field,desc';
        },
      },
    });
  };
}
