import { AppFooter } from './app.footer';
import { AppSidebar } from './app.sidebar';
import { AppTopbar } from './app.topbar';
import { AppMenuitem } from './app.menuitem';
import { AppMenu } from './app.menu';
import { AppLayout } from './app.layout';

describe('shared-ui-layout components', () => {
  it('AppFooter should be defined', () => {
    expect(AppFooter).toBeDefined();
  });

  it('AppSidebar should be defined', () => {
    expect(AppSidebar).toBeDefined();
  });

  it('AppTopbar should be defined', () => {
    expect(AppTopbar).toBeDefined();
  });

  it('AppMenuitem should be defined', () => {
    expect(AppMenuitem).toBeDefined();
  });

  it('AppMenu should be defined', () => {
    expect(AppMenu).toBeDefined();
  });

  it('AppLayout should be defined', () => {
    expect(AppLayout).toBeDefined();
  });
});
