if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PresetPanelView_Params {
    presetList?: VolumePreset[];
    presetNameInput?: string;
    presetNameDialogController?: CustomDialogController;
    duplicateDialogController?: CustomDialogController;
    presetService?: PresetService;
}
interface DuplicateConfirmDialog_Params {
    controller?: CustomDialogController;
    duplicateName?: string;
    onOverwrite?: (name: string) => void;
}
interface PresetNameDialog_Params {
    controller?: CustomDialogController;
    presetNameInput?: string;
    onConfirm?: (name: string) => void;
}
import type { VolumePreset } from '../model/VolumePreset';
import { PresetService, SavePresetResult } from "@normalized:N&&&entry/src/main/ets/service/PresetService&";
import { PresetConstants } from "@normalized:N&&&entry/src/main/ets/common/PresetConstants&";
import { PresetListItem } from "@normalized:N&&&entry/src/main/ets/components/PresetListItem&";
import promptAction from "@ohos:promptAction";
import { Logger } from "@normalized:N&&&entry/src/main/ets/utils/Logger&";
const TAG = 'PresetPanelView';
class PresetNameDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.__presetNameInput = new ObservedPropertySimplePU('', this, "presetNameInput");
        this.onConfirm = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PresetNameDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.presetNameInput !== undefined) {
            this.presetNameInput = params.presetNameInput;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
    }
    updateStateVars(params: PresetNameDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__presetNameInput.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__presetNameInput.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private __presetNameInput: ObservedPropertySimplePU<string>;
    get presetNameInput() {
        return this.__presetNameInput.get();
    }
    set presetNameInput(newValue: string) {
        this.__presetNameInput.set(newValue);
    }
    private onConfirm: (name: string) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 20, right: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('保存预设');
            Text.fontSize(18);
            Text.fontColor(Color.Black);
            Text.fontWeight(FontWeight.Medium);
            Text.margin({ top: 20, bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入预设名称', text: { value: this.presetNameInput, changeEvent: newValue => { this.presetNameInput = newValue; } } });
            TextInput.fontSize(16);
            TextInput.fontColor(Color.Black);
            TextInput.placeholderColor('#999999');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(PresetConstants.BORDER_RADIUS);
            TextInput.height(48);
            TextInput.width('100%');
            TextInput.padding({ left: 16, right: 16 });
            TextInput.maxLength(PresetConstants.MAX_NAME_LENGTH);
            TextInput.margin({ bottom: 16 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.fontSize(16);
            Button.fontColor('#666666');
            Button.backgroundColor('#F5F5F5');
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            Button.height(40);
            Button.layoutWeight(1);
            Button.onClick(() => {
                console.log('[PresetPanelView] PresetNameDialog cancel clicked');
                this.controller.close();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.width(16);
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('确定');
            Button.fontSize(16);
            Button.fontColor(Color.White);
            Button.backgroundColor('#007DFF');
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            Button.height(40);
            Button.layoutWeight(1);
            Button.onClick(() => {
                console.log('[PresetPanelView] PresetNameDialog confirm clicked, name: ' + this.presetNameInput);
                Logger.info(TAG, 'PresetNameDialog confirm, name: ' + this.presetNameInput);
                this.onConfirm(this.presetNameInput);
                this.controller.close();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class DuplicateConfirmDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.duplicateName = '';
        this.onOverwrite = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DuplicateConfirmDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.duplicateName !== undefined) {
            this.duplicateName = params.duplicateName;
        }
        if (params.onOverwrite !== undefined) {
            this.onOverwrite = params.onOverwrite;
        }
    }
    updateStateVars(params: DuplicateConfirmDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private duplicateName: string;
    private onOverwrite: (name: string) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 20, right: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('该名称已存在，是否覆盖？');
            Text.fontSize(16);
            Text.fontColor(Color.Black);
            Text.margin({ top: 24, bottom: 24 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.fontSize(16);
            Button.fontColor('#666666');
            Button.backgroundColor('#F5F5F5');
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            Button.height(40);
            Button.layoutWeight(1);
            Button.onClick(() => {
                this.controller.close();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.width(16);
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('覆盖');
            Button.fontSize(16);
            Button.fontColor(Color.White);
            Button.backgroundColor('#007DFF');
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            Button.height(40);
            Button.layoutWeight(1);
            Button.onClick(() => {
                console.log('[PresetPanelView] DuplicateConfirmDialog overwrite, name: ' + this.duplicateName);
                Logger.info(TAG, 'DuplicateConfirmDialog overwrite, name: ' + this.duplicateName);
                this.onOverwrite(this.duplicateName);
                this.controller.close();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
export class PresetPanelView extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__presetList = new ObservedPropertyObjectPU([], this, "presetList");
        this.__presetNameInput = new ObservedPropertySimplePU('', this, "presetNameInput");
        this.presetNameDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new PresetNameDialog(this, {
                    onConfirm: (name: string) => {
                        this.confirmSavePreset(name);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/components/PresetPanelView.ets", line: 157, col: 14 });
                jsDialog.setController(this.presetNameDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        onConfirm: (name: string) => {
                            this.confirmSavePreset(name);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            alignment: DialogAlignment.Center,
            customStyle: true
        }, this);
        this.duplicateDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new DuplicateConfirmDialog(this, {
                    onOverwrite: (name: string) => {
                        this.confirmOverwrite(name);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/components/PresetPanelView.ets", line: 169, col: 14 });
                jsDialog.setController(this.duplicateDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        onOverwrite: (name: string) => {
                            this.confirmOverwrite(name);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            alignment: DialogAlignment.Center,
            customStyle: true
        }, this);
        this.presetService = PresetService.getInstance();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PresetPanelView_Params) {
        if (params.presetList !== undefined) {
            this.presetList = params.presetList;
        }
        if (params.presetNameInput !== undefined) {
            this.presetNameInput = params.presetNameInput;
        }
        if (params.presetNameDialogController !== undefined) {
            this.presetNameDialogController = params.presetNameDialogController;
        }
        if (params.duplicateDialogController !== undefined) {
            this.duplicateDialogController = params.duplicateDialogController;
        }
        if (params.presetService !== undefined) {
            this.presetService = params.presetService;
        }
    }
    updateStateVars(params: PresetPanelView_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__presetList.purgeDependencyOnElmtId(rmElmtId);
        this.__presetNameInput.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__presetList.aboutToBeDeleted();
        this.__presetNameInput.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __presetList: ObservedPropertyObjectPU<VolumePreset[]>;
    get presetList() {
        return this.__presetList.get();
    }
    set presetList(newValue: VolumePreset[]) {
        this.__presetList.set(newValue);
    }
    private __presetNameInput: ObservedPropertySimplePU<string>;
    get presetNameInput() {
        return this.__presetNameInput.get();
    }
    set presetNameInput(newValue: string) {
        this.__presetNameInput.set(newValue);
    }
    /** 预设名称输入对话框控制器 */
    private presetNameDialogController: CustomDialogController;
    /** 重名确认对话框控制器 */
    private duplicateDialogController: CustomDialogController;
    private presetService: PresetService;
    aboutToAppear(): void {
        this.loadPresetList();
        this.presetService.setOnPresetListChange(() => {
            this.loadPresetList();
        });
    }
    private async loadPresetList(): Promise<void> {
        try {
            this.presetList = await this.presetService.getPresetList();
            Logger.info(TAG, 'Loaded ' + this.presetList.length + ' presets');
        }
        catch (error) {
            Logger.error(TAG, 'Failed to load preset list: ' + error);
        }
    }
    /**
     * 保存预设按钮点击处理
     */
    private onSavePresetClick(): void {
        console.log('[PresetPanelView] onSavePresetClick triggered');
        Logger.info(TAG, 'onSavePresetClick triggered, opening CustomDialog');
        this.presetNameDialogController.open();
    }
    /**
     * 确认保存预设
     */
    private async confirmSavePreset(name: string): Promise<void> {
        console.log('[PresetPanelView] confirmSavePreset START, name: ' + name);
        Logger.info(TAG, 'confirmSavePreset called, name: ' + name);
        try {
            console.log('[PresetPanelView] Calling presetService.saveCurrentAsPreset...');
            Logger.info(TAG, 'Calling presetService.saveCurrentAsPreset...');
            const result = await this.presetService.saveCurrentAsPreset(name);
            console.log('[PresetPanelView] saveCurrentAsPreset result: ' + result);
            Logger.info(TAG, 'saveCurrentAsPreset result: ' + result);
            switch (result) {
                case SavePresetResult.SUCCESS:
                    console.log('[PresetPanelView] SUCCESS - Preset saved');
                    Logger.info(TAG, 'Preset saved successfully');
                    promptAction.showToast({
                        message: '预设保存成功'
                    });
                    break;
                case SavePresetResult.EMPTY_NAME:
                    console.log('[PresetPanelView] EMPTY_NAME');
                    Logger.warn(TAG, 'Preset name is empty');
                    promptAction.showToast({
                        message: '预设名称不能为空'
                    });
                    break;
                case SavePresetResult.DUPLICATE:
                    console.log('[PresetPanelView] DUPLICATE');
                    Logger.info(TAG, 'Preset name duplicate, showing confirm dialog');
                    this.duplicateDialogController.open();
                    break;
                case SavePresetResult.LIMIT_EXCEEDED:
                    console.log('[PresetPanelView] LIMIT_EXCEEDED');
                    Logger.warn(TAG, 'Preset count limit exceeded');
                    promptAction.showToast({
                        message: '预设数量已达上限（' + PresetConstants.MAX_PRESET_COUNT + '个）'
                    });
                    break;
                case SavePresetResult.NOT_INITIALIZED:
                    console.log('[PresetPanelView] NOT_INITIALIZED');
                    Logger.error(TAG, 'PresetStorage is not initialized');
                    promptAction.showToast({
                        message: '存储未初始化，请重启应用'
                    });
                    break;
            }
            console.log('[PresetPanelView] confirmSavePreset END');
        }
        catch (error) {
            console.error('[PresetPanelView] ERROR: ' + error);
            Logger.error(TAG, 'Error saving preset: ' + error);
            promptAction.showToast({
                message: '保存失败'
            });
        }
    }
    /**
     * 确认覆盖预设
     */
    private async confirmOverwrite(name: string): Promise<void> {
        console.log('[PresetPanelView] confirmOverwrite START, name: ' + name);
        Logger.info(TAG, 'confirmOverwrite called, name: ' + name);
        try {
            const success = await this.presetService.overwritePreset(name);
            if (success) {
                console.log('[PresetPanelView] Overwrite SUCCESS');
                Logger.info(TAG, 'Preset overwritten successfully');
                promptAction.showToast({
                    message: '预设已覆盖'
                });
            }
            else {
                console.log('[PresetPanelView] Overwrite FAILED');
                Logger.error(TAG, 'Preset overwrite failed');
                promptAction.showToast({
                    message: '覆盖失败'
                });
            }
        }
        catch (error) {
            Logger.error(TAG, 'Error overwriting preset: ' + error);
            promptAction.showToast({
                message: '覆盖失败'
            });
        }
    }
    private async onApplyPreset(presetId: string): Promise<void> {
        try {
            const success = await this.presetService.applyPreset(presetId);
            if (success) {
                promptAction.showToast({
                    message: '预设已应用'
                });
            }
            else {
                promptAction.showToast({
                    message: '应用失败'
                });
            }
        }
        catch (error) {
            Logger.error(TAG, 'Error applying preset: ' + error);
            promptAction.showToast({
                message: '应用失败'
            });
        }
    }
    private async onDeletePreset(presetId: string): Promise<void> {
        try {
            const success = await this.presetService.deletePreset(presetId);
            if (success) {
                promptAction.showToast({
                    message: '预设已删除'
                });
                await this.loadPresetList();
            }
            else {
                promptAction.showToast({
                    message: '删除失败'
                });
            }
        }
        catch (error) {
            Logger.error(TAG, 'Error deleting preset: ' + error);
            promptAction.showToast({
                message: '删除失败'
            });
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: PresetConstants.PANEL_PADDING, right: PresetConstants.PANEL_PADDING });
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(PresetConstants.BORDER_RADIUS);
        }, Column);
        this.buildActionBar.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('#F1F3F5');
            Divider.height(1);
            Divider.margin({ top: 8, bottom: 8 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.presetList.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildEmptyState.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.buildPresetList.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    buildActionBar(parent = null): void {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(48);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('音量预设');
            Text.fontSize(18);
            Text.fontColor(Color.Black);
            Text.fontWeight(FontWeight.Medium);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存预设');
            Button.fontSize(14);
            Button.fontColor(Color.White);
            Button.backgroundColor('#007DFF');
            Button.borderRadius(PresetConstants.BORDER_RADIUS);
            Button.height(36);
            Button.padding({ left: 16, right: 16 });
            Button.onClick(() => {
                this.onSavePresetClick();
            });
        }, Button);
        Button.pop();
        Row.pop();
    }
    buildEmptyState(parent = null): void {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height(80);
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('暂无预设，点击保存按钮创建');
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        Column.pop();
    }
    /**
     * 使用 GridRow/GridCol 构建预设列表
     * 大小屏均保持单列列表布局，利用断点实现响应式间距适配
     */
    buildPresetList(parent = null): void {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridRow.create({
                columns: 1,
                gutter: { x: 0, y: PresetConstants.LIST_SPACE },
                breakpoints: { reference: BreakpointsReference.WindowSize, value: [PresetConstants.TABLET_BREAKPOINT + 'vp'] }
            });
            GridRow.width('100%');
        }, GridRow);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const preset = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    GridCol.create({ span: 1 });
                }, GridCol);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new PresetListItem(this, {
                                preset: preset,
                                onApply: () => {
                                    this.onApplyPreset(preset.id);
                                },
                                onDelete: () => {
                                    this.onDeletePreset(preset.id);
                                }
                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/PresetPanelView.ets", line: 407, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    preset: preset,
                                    onApply: () => {
                                        this.onApplyPreset(preset.id);
                                    },
                                    onDelete: () => {
                                        this.onDeletePreset(preset.id);
                                    }
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                preset: preset
                            });
                        }
                    }, { name: "PresetListItem" });
                }
                GridCol.pop();
            };
            this.forEachUpdateFunction(elmtId, this.presetList, forEachItemGenFunction, (preset: VolumePreset) => preset.id, false, false);
        }, ForEach);
        ForEach.pop();
        GridRow.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
