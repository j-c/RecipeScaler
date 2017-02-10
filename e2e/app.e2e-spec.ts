import { RSPage } from './app.po';

describe('rs App', function() {
  let page: RSPage;

  beforeEach(() => {
    page = new RSPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
