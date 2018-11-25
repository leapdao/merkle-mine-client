// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  base_url: 'https://dow2co8nrb.execute-api.eu-west-1.amazonaws.com/v0/proof/',
  eth_nodes: {
    0: 'https://rinkeby.infura.io',
  },
  contract_addresses: {
    0: '0xe88505ff346395e77d338ad2f162e636564d342f',
  }
};
