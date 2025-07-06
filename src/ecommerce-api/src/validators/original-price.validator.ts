// validators/original-price.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsOriginalPriceHigherThanPrice(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOriginalPriceHigherThanPrice',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(originalPrice: number, args: ValidationArguments) {
          const price = (args.object as any).price;
          return (
            typeof originalPrice === 'number' &&
            typeof price === 'number' &&
            originalPrice > price
          );
        },
        defaultMessage(args: ValidationArguments) {
          return 'Giá trước giảm (`originalPrice`) phải lớn hơn giá bán (`price`)';
        },
      },
    });
  };
}
