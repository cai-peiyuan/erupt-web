import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {View} from "../../model/erupt-field.model";
import {EditType, ViewType} from "../../model/erupt.enum";
import {DataService} from "@shared/service/data.service";
import {STComponent} from "@delon/abc";
import {NzCarouselComponent} from "ng-zorro-antd";

@Component({
    selector: "erupt-view-type",
    templateUrl: "./view-type.component.html",
    styleUrls: ["./view-type.component.less"],
    styles: []
})
export class ViewTypeComponent implements OnInit, AfterViewInit {

    @Input() view: View;

    @Input() value: any;

    @Input() eruptName: string;

    show: boolean = false;

    paths: string[] = [];

    viewType = ViewType;

    constructor() {
    }

    ngOnInit() {
        if (this.value) {
            if (this.view.eruptFieldModel.eruptFieldJson.edit.type === EditType.ATTACHMENT) {
                const attachmentType = this.view.eruptFieldModel.eruptFieldJson.edit.attachmentType;
                let _paths = (<string>this.value).split(attachmentType.fileSeparator);
                for (let path of _paths) {
                    this.paths.push(DataService.previewAttachment(path));
                }
            } else {
                this.paths.push(DataService.previewAttachment(this.value));
            }
            switch (this.view.viewType) {
                case ViewType.ATTACHMENT_DIALOG:
                    this.value = [DataService.previewAttachment(this.value)];
                    break;
            }
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.show = true;
        }, 200);
    }

    @ViewChild("carousel", {static: false}) carouselComponent: NzCarouselComponent;

    currIndex: number = 0;

    goToCarouselIndex(index) {
        this.carouselComponent.goTo(index);
        this.currIndex = index;
    }

}
