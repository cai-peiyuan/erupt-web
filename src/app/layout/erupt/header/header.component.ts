import {ChangeDetectorRef, Component, Inject, Input, OnInit} from "@angular/core";
import {Menu, MenuIcon, MenuService, SettingsService} from "@delon/theme";
import screenfull from 'screenfull';
import {CustomerTool, WindowModel} from "@shared/model/window.model";
import {Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {HeaderSearchComponent} from "./components/search.component";
import {MenuVo} from "@shared/model/erupt-menu";
import {AppViewService} from "@shared/service/app-view.service";
import {Nav} from "../menu/menu.component";
import {filter, Subject, takeUntil} from 'rxjs';
import {DOCUMENT} from "@angular/common";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {DomSanitizer} from "@angular/platform-browser";
import {InputBoolean, InputNumber} from "@delon/util/decorator";

@Component({
    selector: "layout-header",
    templateUrl: "./header.component.html",
    styleUrls: [
        "./header.component.less"
    ]
})
export class HeaderComponent implements OnInit {

    @Input() menu: MenuVo[];

    searchToggleStatus: boolean;

    isFullScreen: boolean = false;

    collapse: boolean = false;

    title = WindowModel.title;

    logoPath: string = WindowModel.logoPath;

    logoText: string = WindowModel.logoText;

    r_tools: CustomerTool[] = WindowModel.r_tools;

    drawerVisible: boolean = false;

    desc: string;

    loading: boolean = true;

    menuLoaded: boolean = false;

    list: Nav[] = [];

    private destroy$ = new Subject<void>();

    @Input() @InputNumber() maxLevelIcon = 3;

    @Input() @InputBoolean() disabledAcl = false;

    openDrawer() {
        this.drawerVisible = true;
    }

    closeDrawer(): void {
        this.drawerVisible = false;
    }

    constructor(
                private sanitizer: DomSanitizer,
                private cdr: ChangeDetectorRef,
                private menuSrv: MenuService,
                @Inject(DOCUMENT) private doc: NzSafeAny,
                public settings: SettingsService,
                private router: Router,
                private appViewService: AppViewService,
                @Inject(NzModalService) private modal: NzModalService) {
    }

    ngOnInit() {
        const {doc, router, destroy$, menuSrv, settings, cdr} = this;
        menuSrv.change.pipe(takeUntil(destroy$)).subscribe(data => {
            menuSrv.visit(data, (i: Nav, _p, depth) => {
                i._text = this.sanitizer.bypassSecurityTrustHtml(i.text!);
                i._needIcon = depth! <= this.maxLevelIcon && !!i.icon;
                if (!i._aclResult) {
                    if (this.disabledAcl) {
                        i.disabled = true;
                    } else {
                        i._hidden = true;
                    }
                }
                const icon = i.icon as MenuIcon;
                if (icon && icon.type === 'svg' && typeof icon.value === 'string') {
                    icon.value = this.sanitizer.bypassSecurityTrustHtml(icon.value!!);
                }
            });
            this.fixHide(data);
            this.loading = false;
            this.list = data.filter((w: Nav) => true);
            //console.log('this.list', this.list);
            /*if (this.list.length > 0 && this.list[0].children.length > 1 && this.menuLoaded == false) {
                this.showFirstMenu();
                this.menuLoaded = true;
            }*/
            cdr.detectChanges();
        });

        this.r_tools.forEach(tool => {
            tool.load && tool.load();
        });
        this.appViewService.routerViewDescSubject.subscribe(value => {
            this.desc = value;
        })
    }

    ngAfterInit() {
        this.showFirstMenu();
    }

    ngAfterContentInit() {
        this.showFirstMenu();
    }

    toggleCollapsedSidebar() {
        this.settings.setLayout("collapsed", !this.settings.layout.collapsed);
    }

    searchToggleChange() {
        this.searchToggleStatus = !this.searchToggleStatus;
    }

    toggleScreen() {
        let sf = screenfull;
        if (sf.isEnabled) {
            this.isFullScreen = !sf.isFullscreen;
            sf.toggle();
        }
    }

    customToolsFun(event: Event, tool: CustomerTool) {
        tool.click && tool.click(event);
    }

    toIndex() {
        this.router.navigateByUrl(this.settings.user['indexPath']);
        return false;
    }

    search() {
        this.modal.create({
            nzWrapClassName: "modal-xs",
            nzMaskClosable: true,
            nzKeyboard: true,
            nzFooter: null,
            nzClosable: false,
            nzBodyStyle: {
                padding: "12px"
            },
            nzContent: HeaderSearchComponent,
            nzComponentParams: {
                menu: this.menu
            }
        })
    }

    //显示第一个菜单
    private showFirstMenu() {
       // console.log('显示第一个菜单')
        if (this.menuSrv.menus[0]) {
            this.toModule(this.menuSrv.menus[0].children[0])
        }
    }

    /**
     * 切换到指定模块
     * @param item
     */
    toModule(item: Menu): void {
        //console.log('左侧功能导航显示指定的模块的菜单', item)
        let key = item.key;
        //console.log(this.menuSrv)
        for (const keyKey in this.menuSrv.menus[0].children) {
            this.menuSrv.menus[0].children[keyKey]['_hidden'] = true;
            if(this.menuSrv.menus[0].children[keyKey]['key'] == key){
                this.menuSrv.menus[0].children[keyKey]['_hidden'] = false;
            }
        }
        this.menuSrv.open(item);
    }

    private fixHide(ls: Nav[]): void {
        const inFn = (list: Nav[]): void => {
            for (const item of list) {
                if (item.children && item.children.length > 0) {
                    inFn(item.children);
                    if (!item._hidden) {
                        item._hidden = item.children.every((v: Nav) => v._hidden);
                    }
                }
            }
        };

        inFn(ls);
    }

}
