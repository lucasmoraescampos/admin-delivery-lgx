let apiUrl: string;

let driverUrl: string;

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
  driverUrl: driverUrl
}