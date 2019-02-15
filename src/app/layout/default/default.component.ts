import {
  Component,
  ViewChild,
  ComponentFactoryResolver,
  ViewContainerRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  Inject
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  Router,
  NavigationEnd,
  RouteConfigLoadStart,
  NavigationError,
  NavigationCancel, ActivatedRoute
} from "@angular/router";
import { NzMessageService, NzIconService } from "ng-zorro-antd";
import { Subscription } from "rxjs";
import { updateHostClass } from "@delon/util";
import { ScrollService, MenuService, SettingsService, Menu } from "@delon/theme";

// #region icons

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  SearchOutline,
  SettingOutline,
  FullscreenOutline,
  FullscreenExitOutline,
  BellOutline,
  LockOutline,
  PlusOutline,
  UserOutline,
  LogoutOutline,
  EllipsisOutline,
  GlobalOutline,
  ArrowDownOutline,
  // Optional
  GithubOutline,
  AppstoreOutline
} from "@ant-design/icons-angular/icons";

const ICONS = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  SearchOutline,
  SettingOutline,
  FullscreenOutline,
  FullscreenExitOutline,
  BellOutline,
  LockOutline,
  PlusOutline,
  UserOutline,
  LogoutOutline,
  EllipsisOutline,
  GlobalOutline,
  ArrowDownOutline,
  // Optional
  GithubOutline,
  AppstoreOutline
];

// #endregion

import { environment } from "@env/environment";
import { SettingDrawerComponent } from "./setting-drawer/setting-drawer.component";
import { DataService } from "../../erupt/service/data.service";

@Component({
  selector: "layout-default",
  templateUrl: "./default.component.html",
  preserveWhitespaces: false,
  host: {
    "[class.alain-default]": "true"
  },
  styleUrls: [
    "./default.component.less"
  ]
})
export class LayoutDefaultComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private notify$: Subscription;
  isFetching = false;

  nowYear = new Date().getFullYear();
  // @ViewChild("settingHost", { read: ViewContainerRef })
  // settingHost: ViewContainerRef;

  constructor(iconSrv: NzIconService,
              router: Router,
              scroll: ScrollService,
              _message: NzMessageService,
              private resolver: ComponentFactoryResolver,
              public menuSrv: MenuService,
              public settings: SettingsService,
              private el: ElementRef,
              private renderer: Renderer2,
              public route: ActivatedRoute,
              public data: DataService,
              @Inject(DOCUMENT) private doc: any) {
    iconSrv.addIcon(...ICONS);
    // scroll to top in change page
    router.events.subscribe(evt => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true;
      }
      if (evt instanceof NavigationError || evt instanceof NavigationCancel) {
        this.isFetching = false;
        if (evt instanceof NavigationError) {
          _message.error(`无法加载${evt.url}路由`, { nzDuration: 1000 * 3 });
        }
        return;
      }
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      setTimeout(() => {
        scroll.scrollToTop();
        this.isFetching = false;
      }, 2000);
    });
  }

  private setClass() {
    const { el, renderer, settings } = this;
    const layout = settings.layout;
    updateHostClass(
      el.nativeElement,
      renderer,
      {
        ["alain-default"]: true,
        [`alain-default__fixed`]: layout.fixed,
        [`alain-default__boxed`]: layout.boxed,
        [`alain-default__collapsed`]: layout.collapsed
      },
      true
    );

    this.doc.body.classList[layout.colorWeak ? "add" : "remove"]("color-weak");
  }

  ngAfterViewInit(): void {
    // Setting componet for only developer
    // if (!environment.production) {
    //   setTimeout(() => {
    //     const settingFactory = this.resolver.resolveComponentFactory(
    //       SettingDrawerComponent
    //     );
    //     this.settingHost.createComponent(settingFactory);
    //   }, 22);
    // }
  }

  ngOnInit() {
    this.notify$ = this.settings.notify.subscribe(() => this.setClass());
    this.setClass();
    //fill menu
    this.data.getMenu().subscribe(result => {
      function gcMenu(nodes) {
        const tempNodes = [];
        nodes.forEach(node => {
          let option: any = {
            text: node.data.name,
            linkExact: true,
            link: node.data.path,
            icon: {
              type: "class",
              value: node.data.icon
            }
          };
          if (node.children && node.children.length > 0) {
            tempNodes.push(option);
            option.children = gcMenu(node.children);
          } else {
            tempNodes.push(option);
          }
        });
        return tempNodes;
      }
      this.menuSrv.add([{
        group: false,
        text: "~",
        children: gcMenu(result)
      }]);
    });

  }

  ngOnDestroy() {
    this.notify$.unsubscribe();
  }
}
