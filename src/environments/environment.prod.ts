let apiUrl: string;

let driverUrl: string;

const stripeKey: string = 'pk_live_51KdMsrCCjfenGFMK7YBBcA5Uf6VpSK7KLhUuzALHnD7VusDB8pGTUXrRYo4IrxERY256endehRHDdfqUiw6ehUgC002snDja0p';

switch (window.location.host) {

  case 'app.fariaslgx.com':
    apiUrl = 'https://api.fariaslgx.com';
    driverUrl = 'https://driver.fariaslgx.com';
    break;

  case 'homologadmin.fariaslgx.com':
    apiUrl = 'https://homologapi.fariaslgx.com';
    driverUrl = 'https://homologdriver.fariaslgx.com';
    break;

  default:
    apiUrl = 'http://localhost:8000';
    driverUrl = 'http://localhost:8100';
    break;

}

export const environment = {
  production: true,
  apiUrl: apiUrl,
  driverUrl: driverUrl,
  stripeKey: stripeKey
}