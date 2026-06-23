/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { VolumePreset } from '../model/VolumePreset';
import { PresetService, SavePresetResult } from '../service/PresetService';
import { PresetConstants } from '../common/PresetConstants';
import { PresetListItem } from './PresetListItem';
import { promptAction } from '@kit.ArkUI';
import { Logger } from '../utils/Logger';

const TAG = 'PresetPanelView';

/**
 * 预设名称输入对话框
 * 使用CustomDialog替代bindSheet，避免与外层bindSheet冲突导致对话框立即关闭
 */
@CustomDialog
struct PresetNameDialog {
  controller: CustomDialogController;
  @State presetNameInput: string = '';
  onConfirm: (name: string) => void = () => {};

  build() {
    Column() {
      Text('保存预设')
        .fontSize(18)
        .fontColor(Color.Black)
        .fontWeight(FontWeight.Medium)
        .margin({ top: 20, bottom: 16 });

      TextInput({ placeholder: '请输入预设名称', text: $$this.presetNameInput })
        .fontSize(16)
        .fontColor(Color.Black)
        .placeholderColor('#999999')
        .backgroundColor('#F5F5F5')
        .borderRadius(PresetConstants.BORDER_RADIUS)
        .height(48)
        .width('100%')
        .padding({ left: 16, right: 16 })
        .maxLength(PresetConstants.MAX_NAME_LENGTH)
        .margin({ bottom: 16 });

      Row() {
        Button('取消')
          .fontSize(16)
          .fontColor('#666666')
          .backgroundColor('#F5F5F5')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(40)
          .layoutWeight(1)
          .onClick(() => {
            console.log('[PresetPanelView] PresetNameDialog cancel clicked');
            this.controller.close();
          });

        Blank().width(16);

        Button('确定')
          .fontSize(16)
          .fontColor(Color.White)
          .backgroundColor('#007DFF')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(40)
          .layoutWeight(1)
          .onClick(() => {
            console.log('[PresetPanelView] PresetNameDialog confirm clicked, name: ' + this.presetNameInput);
            Logger.info(TAG, 'PresetNameDialog confirm, name: ' + this.presetNameInput);
            this.onConfirm(this.presetNameInput);
            this.controller.close();
          });
      }
      .width('100%')
      .padding({ left: 16, right: 16 });
    }
    .width('100%')
    .padding({ left: 20, right: 20 });
  }
}

/**
 * 重名确认对话框
 * 使用CustomDialog替代bindSheet，避免与外层bindSheet冲突
 */
@CustomDialog
struct DuplicateConfirmDialog {
  controller: CustomDialogController;
  duplicateName: string = '';
  onOverwrite: (name: string) => void = () => {};

  build() {
    Column() {
      Text('该名称已存在，是否覆盖？')
        .fontSize(16)
        .fontColor(Color.Black)
        .margin({ top: 24, bottom: 24 });

      Row() {
        Button('取消')
          .fontSize(16)
          .fontColor('#666666')
          .backgroundColor('#F5F5F5')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(40)
          .layoutWeight(1)
          .onClick(() => {
            this.controller.close();
          });

        Blank().width(16);

        Button('覆盖')
          .fontSize(16)
          .fontColor(Color.White)
          .backgroundColor('#007DFF')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(40)
          .layoutWeight(1)
          .onClick(() => {
            console.log('[PresetPanelView] DuplicateConfirmDialog overwrite, name: ' + this.duplicateName);
            Logger.info(TAG, 'DuplicateConfirmDialog overwrite, name: ' + this.duplicateName);
            this.onOverwrite(this.duplicateName);
            this.controller.close();
          });
      }
      .width('100%')
      .padding({ left: 16, right: 16 });
    }
    .width('100%')
    .padding({ left: 20, right: 20 });
  }
}

/**
 * 预设管理面板组件
 * 提供预设保存、列表展示、应用、删除功能
 * 使用 GridRow/GridCol 实现大小屏适配，手机和平板均保持单列列表布局
 */
@Component
export struct PresetPanelView {
  @State presetList: VolumePreset[] = [];
  @State presetNameInput: string = '';

  /** 预设名称输入对话框控制器 */
  private presetNameDialogController: CustomDialogController = new CustomDialogController({
    builder: PresetNameDialog({
      onConfirm: (name: string) => {
        this.confirmSavePreset(name);
      }
    }),
    autoCancel: true,
    alignment: DialogAlignment.Center,
    customStyle: true
  });

  /** 重名确认对话框控制器 */
  private duplicateDialogController: CustomDialogController = new CustomDialogController({
    builder: DuplicateConfirmDialog({
      onOverwrite: (name: string) => {
        this.confirmOverwrite(name);
      }
    }),
    autoCancel: true,
    alignment: DialogAlignment.Center,
    customStyle: true
  });

  private presetService: PresetService = PresetService.getInstance();

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
    } catch (error) {
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
    } catch (error) {
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
      } else {
        console.log('[PresetPanelView] Overwrite FAILED');
        Logger.error(TAG, 'Preset overwrite failed');
        promptAction.showToast({
          message: '覆盖失败'
        });
      }
    } catch (error) {
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
      } else {
        promptAction.showToast({
          message: '应用失败'
        });
      }
    } catch (error) {
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
      } else {
        promptAction.showToast({
          message: '删除失败'
        });
      }
    } catch (error) {
      Logger.error(TAG, 'Error deleting preset: ' + error);
      promptAction.showToast({
        message: '删除失败'
      });
    }
  }

  build() {
    Column() {
      this.buildActionBar();

      Divider()
        .color('#F1F3F5')
        .height(1)
        .margin({ top: 8, bottom: 8 });

      if (this.presetList.length === 0) {
        this.buildEmptyState();
      } else {
        this.buildPresetList();
      }
    }
    .width('100%')
    .padding({ left: PresetConstants.PANEL_PADDING, right: PresetConstants.PANEL_PADDING })
    .backgroundColor('#FFFFFF')
    .borderRadius(PresetConstants.BORDER_RADIUS)
  }

  @Builder buildActionBar(): void {
    Row() {
      Text('音量预设')
        .fontSize(18)
        .fontColor(Color.Black)
        .fontWeight(FontWeight.Medium)
        .layoutWeight(1);

      Button('保存预设')
        .fontSize(14)
        .fontColor(Color.White)
        .backgroundColor('#007DFF')
        .borderRadius(PresetConstants.BORDER_RADIUS)
        .height(36)
        .padding({ left: 16, right: 16 })
        .onClick(() => {
          this.onSavePresetClick();
        });
    }
    .width('100%')
    .height(48);
  }

  @Builder buildEmptyState(): void {
    Column() {
      Text('暂无预设，点击保存按钮创建')
        .fontSize(14)
        .fontColor('#999999')
        .textAlign(TextAlign.Center);
    }
    .width('100%')
    .height(80)
    .justifyContent(FlexAlign.Center);
  }

  /**
   * 使用 GridRow/GridCol 构建预设列表
   * 大小屏均保持单列列表布局，利用断点实现响应式间距适配
   */
  @Builder buildPresetList(): void {
    GridRow({
      columns: 1,
      gutter: { x: 0, y: PresetConstants.LIST_SPACE },
      breakpoints: { reference: BreakpointsReference.WindowSize, value: [PresetConstants.TABLET_BREAKPOINT + 'vp'] }
    }) {
      ForEach(this.presetList, (preset: VolumePreset) => {
        GridCol({ span: 1 }) {
          PresetListItem({
            preset: preset,
            onApply: () => {
              this.onApplyPreset(preset.id);
            },
            onDelete: () => {
              this.onDeletePreset(preset.id);
            }
          });
        }
      }, (preset: VolumePreset) => preset.id);
    }
    .width('100%')
  }
}