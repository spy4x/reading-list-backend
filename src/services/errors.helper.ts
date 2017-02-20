type ErrorType = 'CastError' |
  'CustomValidationError' |
  'ValidationError' |
  'BlockedUserError' |
  'JsonWebTokenError' |
  'TokenExpiredError' |
  'NotFoundError';

export class ErrorHelper {

  static init () {
    /* tslint:disable:no-invalid-this only-arrow-functions */
    Object.defineProperty(Error.prototype, 'toJSON', {
      configurable: true,
      value: function () {
        const alt: any = {};
        const storeKey = (key: any) => alt[key] = this[key];
        Object.getOwnPropertyNames(this).forEach(storeKey, this);
        return alt;
      }
    });
    /* tsline:enable */
  }


  static readonly Type = {
    Cast: 'CastError' as ErrorType,
    CustomValidation: 'CustomValidationError' as ErrorType,
    Validation: 'ValidationError' as ErrorType,
    BlockedUser: 'BlockedUserError' as ErrorType,
    JsonWebToken: 'JsonWebTokenError' as ErrorType,
    TokenExpired: 'TokenExpiredError' as ErrorType,
    NotFound: 'NotFoundError' as ErrorType
  };

}
