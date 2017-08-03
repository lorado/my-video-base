import { MyVideoBasePage } from './app.po';

describe('my-video-base App', () => {
  let page: MyVideoBasePage;

  beforeEach(() => {
    page = new MyVideoBasePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
