import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {Bi, Dimension, DimType} from "../model/bi.model";
import {colRules} from "@shared/model/util.model";
import {ReferenceComponent} from "../components/reference/reference.component";
import {PresetRanges} from "ng-zorro-antd/date-picker/standard-types";
import moment from 'moment';
import {DatePipe} from "@angular/common";
import {NzModalService} from "ng-zorro-antd/modal";
import {I18NService} from "@core";
import {ReferenceTableComponent} from "../components/reference-table/reference-table.component";

@Component({
    selector: 'bi-dimension',
    templateUrl: './dimension.component.html',
    styleUrls: ['./dimension.component.less'],
    styles: []
})
export class DimensionComponent implements OnInit {

    @Input() bi: Bi;

    @Output() search = new EventEmitter();

    col = colRules[3];

    dimType = DimType;

    dateRanges: PresetRanges = {};

    private datePipe: DatePipe = new DatePipe("zh-cn");

    constructor(@Inject(NzModalService) private modal: NzModalService, private i18n: I18NService) {
    }

    ngOnInit() {
        this.dateRanges = <any>{
            [this.i18n.fanyi("global.today")]: [this.datePipe.transform(new Date(), "yyyy-MM-dd 00:00:00"), this.datePipe.transform(new Date(), "yyyy-MM-dd 23:59:59")],
            [this.i18n.fanyi("global.yesterday")]: [this.datePipe.transform(moment().add(-1, 'day').toDate(), "yyyy-MM-dd 00:00:00"), this.datePipe.transform(moment().add(-1, 'day').toDate(), "yyyy-MM-dd 23:59:59")],
            [this.i18n.fanyi("global.date.last_7_day")]: [this.datePipe.transform(moment().add(-7, 'day').toDate(), "yyyy-MM-dd 00:00:00"), this.datePipe.transform(new Date(), "yyyy-MM-dd 23:59:59")],
            [this.i18n.fanyi("global.date.last_30_day")]: [this.datePipe.transform(moment().add(-30, 'day').toDate(), "yyyy-MM-dd 00:00:00"), this.datePipe.transform(new Date(), "yyyy-MM-dd 23:59:59")],
            [this.i18n.fanyi("global.date.this_month")]: [this.datePipe.transform(moment().toDate(), "yyyy-MM-01 00:00:00"), this.datePipe.transform(new Date(), "yyyy-MM-dd 23:59:59")],
            [this.i18n.fanyi("global.date.last_month")]: [this.datePipe.transform(moment().add(-1, 'month').toDate(), "yyyy-MM-01 00:00:00"), this.datePipe.transform(moment().add(-1, 'month').endOf("month").toDate(), "yyyy-MM-dd 23:59:59")]
        };
    }

    enterEvent(event) {
        if (event.which === 13) {
            this.search.emit();
        }
    }

    ref(dim: Dimension) {
        let ref = this.modal.create({
            nzWrapClassName: "modal-xs",
            nzKeyboard: true,
            nzStyle: {top: "30px"},
            nzTitle: dim.title,
            nzContent: ReferenceComponent,
            nzOnOk: (res) => {
                res.confirmNodeChecked();
            }
        });
        Object.assign(ref.getContentComponent(), {
            dimension: dim,
            code: this.bi.code,
            bi: this.bi
        })
    }

    refTable(dim: Dimension) {
        let ref = this.modal.create({
            nzStyle: {top: "20px"},
            nzWrapClassName: "modal-xxl",
            nzBodyStyle: {
                padding: '0',
            },
            nzKeyboard: false,
            nzTitle: dim.title,
            nzContent: ReferenceTableComponent,
            nzOnOk: (res) => {
                res.confirmChecked();
            }
        });
        Object.assign(ref.getContentComponent(), {
            dimension: dim,
            code: this.bi.code,
            bi: this.bi
        })
    }

    clearRef(dim: Dimension) {
        dim.$viewValue = null;
        dim.$value = null;
    }

}
