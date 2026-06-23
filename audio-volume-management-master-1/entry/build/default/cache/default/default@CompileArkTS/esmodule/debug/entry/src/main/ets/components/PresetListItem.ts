if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PresetListItem_Params {
    preset?: VolumePreset;
    /** 应用回调函数 */
    onApply?: () => void;
    /** 删除回调函数 */
    onDelete?: () => void;
}
import type { VolumePreset } from '../model/VolumePreset';
import { PresetConstants } from "@normalized:N&&&entry/src/main/ets/common/PresetConstants&";
export class PresetListItem extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__preset = new SynchedPropertyObjectOneWayPU(params.preset, this, "preset");
        this.onApply = () => { };
        this.onDelete = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PresetListItem_Params) {
        if (params.onApply !== undefined) {
            this.onApply = params.onApply;
        }
        if (params.onDelete !== undefined) {
            this.onDelete = params.onDelete;
        }
    }
    updateStateVars(params: PresetListItem_Params) {
        this.__preset.reset(params.preset);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__preset.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__preset.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    /** 预设数据 */
    private __preset: SynchedPropertySimpleOneWayPU<VolumePreset>;
    get preset() {
        return this.__preset.get();
    }
    set preset(newValue: VolumePreset) {
        this.__preset.set(newValue);
    }
    /** 应用回调函数 */
    private onApply: () => void;
    /** 删除回调函数 */
    private onDelete: () => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(PresetConstants.LIST_ITEM_HEIGHT);
            Row.padding({ left: PresetConstants.PANEL_PADDING, right: PresetConstants.PANEL_PADDING });
            Row.backgroundColor(Color.White);
            Row.borderRadius(PresetConstants.BORDER_RADIUS);
            Row.shadow({
                radius: 2,
                color: '#1F000000',
                offsetX: 0,
                offsetY: 1
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 预设名称
            Text.create(this.preset.name);
            // 预设名称
            Text.fontSize(16);
            // 预设名称
            Text.fontColor(Color.Black);
            // 预设名称
            Text.fontWeight(FontWeight.Normal);
            // 预设名称
            Text.maxLines(1);
            // 预设名称
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            // 预设名称
            Text.layoutWeight(1);
        }, Text);
        // 预设名称
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮区域
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 应用按钮
            Button.createWithLabel('应用');
            // 应用按钮
            Button.fontSize(12);
            // 应用按钮
            Button.fontColor('#007DFF');
            // 应用按钮
            Button.backgroundColor('#E6F0FF');
            // 应用按钮
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            // 应用按钮
            Button.height(28);
            // 应用按钮
            Button.padding({ left: 10, right: 10 });
            // 应用按钮
            Button.onClick(() => {
                this.onApply();
            });
        }, Button);
        // 应用按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 删除按钮
            Button.createWithLabel('删除');
            // 删除按钮
            Button.fontSize(12);
            // 删除按钮
            Button.fontColor('#E84026');
            // 删除按钮
            Button.backgroundColor('#FFF0ED');
            // 删除按钮
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            // 删除按钮
            Button.height(28);
            // 删除按钮
            Button.padding({ left: 10, right: 10 });
            // 删除按钮
            Button.margin({ left: 8 });
            // 删除按钮
            Button.onClick(() => {
                this.onDelete();
            });
        }, Button);
        // 删除按钮
        Button.pop();
        // 操作按钮区域
        Row.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
