// The only place that knows where ASTra lives. Change the GitHub org/repo here
// when the repository moves; every link on the site reads from this file.
export const site = {
  name: 'ASTra',
  brand: 'Attentionform',
  url: 'https://attentionform.com',
  brandUrl: 'https://attentionform.com',
  github: {
    org: 'Attentionform',
    repo: 'astra',
    get url() {
      return `https://github.com/${this.org}/${this.repo}`;
    },
    get releases() {
      return `${this.url}/releases`;
    },
    get issues() {
      return `${this.url}/issues`;
    },
    get discussions() {
      return `${this.url}/discussions`;
    },
  },
  contact: {
    email: 'astra@attentionform.com',
    emailAlt: 'attentionform@protonmail.com',
    discord: 'https://discord.gg/YmJrmXUNF',
    x: 'https://x.com/attentionform',
    xHandle: '@attentionform',
  },
  npmScope: '@attentionform',
  year: 2026,
} as const;
