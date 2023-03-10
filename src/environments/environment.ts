// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

let apiUrl: string;
let driverUrl: string;
let socketUrl: string;
const smsApiUrl: string = 'https://sms.fariaslgx.com/api';
const stripeKey: string = 'pk_test_51KdMsrCCjfenGFMKlYg2uisMXJzNXBGg1F6dgaNI1sFdhXxKs3tsf7GdAskYqmKJb1ZOMlIcz1kJ1mT7niFZUMlb00BaXFNgP4';

switch (window.location.host) {

  case 'app.fariaslgx.com':
    apiUrl = 'https://api.fariaslgx.com';
    driverUrl = 'https://driver.fariaslgx.com';
    socketUrl = 'https://socket.fariaslgx.com';
    break;

  case 'homologadmin.fariaslgx.com':
    apiUrl = 'https://homologapi.fariaslgx.com';
    driverUrl = 'https://homologdriver.fariaslgx.com';
    socketUrl = 'https://socket.fariaslgx.com';
    break;

  default:
    apiUrl = 'http://localhost:8000';
    driverUrl = 'http://localhost:8100';
    socketUrl = 'http://localhost:1337';
    break;

}

export const environment = {
  production: false,
  apiUrl: apiUrl,
  smsApiUrl: smsApiUrl,
  driverUrl: driverUrl,
  socketUrl: socketUrl,
  stripeKey: stripeKey
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
