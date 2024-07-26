export enum BadRequestMessage {
  InvalidLoginData = 'Invalid login data, check your information and try again',
  InvalidRegisterData = 'Invalid Register data, check your information and try again',
}
export enum AuthMessage {
  NotFoundAccount = 'Not found account, please register before logging in',
  AlreadyExistAccount = 'Account already exists, enter different login data or login',
}
export enum NotFoundMessage {}
export enum ValidationMessage {}
export enum PublicMessage {
  SentOtp = 'OTP code sent successfully',
}
