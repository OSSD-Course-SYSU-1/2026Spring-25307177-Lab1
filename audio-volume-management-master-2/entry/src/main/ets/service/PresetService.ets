﻿/*
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
import { PresetStorage } from '../storage/PresetStorage';
import { AudioVolumeController } from '../player/AudioVolumeController';
import { AudioRendererController } from '../player/AudioRendererController';
import { PresetConstants } from '../common/PresetConstants';
import { Logger } from '../utils/Logger';

const TAG = 'PresetService';

/**
 * 音量状态接口
 */
interface VolumeState {
  systemVolume: number;
  appVolume: number;
  audioStreamVolume: number;
}

/**
 * 保存预设结果枚举
 */
export enum SavePresetResult {
  /** 保存成功 */
  SUCCESS = 'success',
  /** 名称为空 */
  EMPTY_NAME = 'empty_name',
  /** 名称重复 */
  DUPLICATE = 'duplicate',
  /** 超出数量限制 */
  LIMIT_EXCEEDED = 'limit_exceeded',
  NOT_INITIALIZED = 'not_initialized'
}

/**
 * 预设管理服务
 * 协调存储层与音量控制层，提供完整的预设管理功能
 */
export class PresetService {
  /** 单例实例 */
  private static instance: PresetService | null = null;

  /** 预设存储服务 */
  private presetStorage: PresetStorage;

  /** 音量控制器 */
  private audioVolumeController: AudioVolumeController;

  /** 音频渲染控制器 */
  private audioRendererController: AudioRendererController | null = null;

  /** 预设列表变化回调 */
  private onPresetListChange: (() => void) | null = null;

  /**
   * 私有构造函数，实现单例模式
   */
  private constructor() {
    this.presetStorage = PresetStorage.getInstance();
    this.audioVolumeController = new AudioVolumeController();
    this.audioVolumeController.creatVolumeManager();
  }

  /**
   * 获取单例实例
   * @returns PresetService实例
   */
  public static getInstance(): PresetService {
    if (!PresetService.instance) {
      PresetService.instance = new PresetService();
    }
    return PresetService.instance;
  }

  /**
   * 设置音频渲染控制器
   * @param controller 音频渲染控制器实例
   */
  public setAudioRendererController(controller: AudioRendererController): void {
    this.audioRendererController = controller;
    Logger.info(TAG, 'AudioRendererController set successfully');
  }

  /**
   * 获取当前完整音量状态
   * @returns 音量状态对象
   */
  private getCurrentVolumeState(): VolumeState {
    // 1. 获取系统音量
    const systemVolume = this.audioVolumeController.getVolumeByStream();

    // 2. 获取应用音量（从AppStorage获取）
    const appVolume = AppStorage.get<number>('appVolume') ?? 100;

    // 3. 获取音频流音量
    const audioStreamVolume = this.audioRendererController?.getVolume() ?? 1;

    Logger.info(TAG, `Current volume state - System: ${systemVolume}, App: ${appVolume}, Stream: ${audioStreamVolume}`);

    const state: VolumeState = {
      systemVolume: systemVolume,
      appVolume: appVolume,
      audioStreamVolume: audioStreamVolume
    };
    return state;
  }

  /**
   * 应用音量状态
   * @param state 音量状态对象
   */
  private async applyVolumeState(state: VolumeState): Promise<void> {
    try {
      // 1. 设置系统音量（通过AppStorage触发UI更新）
      AppStorage.setOrCreate('systemVolume', state.systemVolume);

      // 2. 设置应用音量
      this.audioVolumeController.setAppVolumePercentage(state.appVolume);
      AppStorage.setOrCreate('appVolume', state.appVolume);

      // 3. 设置音频流音量
      if (this.audioRendererController) {
        this.audioRendererController.setVolume(state.audioStreamVolume * 15);
      }

      Logger.info(TAG, 'Volume state applied successfully');
    } catch (error) {
      Logger.error(TAG, `Failed to apply volume state: ${error}`);
    }
  }

  /**
   * 保存当前音量状态为新预设
   * @param name 预设名称
   * @returns 保存结果
   */
  public async saveCurrentAsPreset(name: string): Promise<SavePresetResult> {
    console.log(`[PresetService] saveCurrentAsPreset START, name: "${name}"`);
    Logger.info(TAG, `saveCurrentAsPreset called with name: ${name}`);

    try {
      // 0. 检查存储层是否已初始化
      console.log('[PresetService] Checking if PresetStorage is initialized...');
      Logger.info(TAG, 'Checking if PresetStorage is initialized...');
      if (!this.presetStorage.isInitialized()) {
        console.error('[PresetService] PresetStorage is NOT initialized!');
        Logger.error(TAG, 'PresetStorage is not initialized!');
        Logger.error(TAG, 'Please call PresetStorage.init(context) before saving presets');
        return SavePresetResult.NOT_INITIALIZED;
      }
      console.log('[PresetService] PresetStorage is initialized');
      Logger.info(TAG, 'PresetStorage is initialized');

      // 1. 校验名称是否为空
      if (!name || name.trim().length === 0) {
        console.log('[PresetService] Preset name is empty');
        Logger.error(TAG, 'Preset name is empty');
        return SavePresetResult.EMPTY_NAME;
      }

      // 2. 校验名称长度
      if (name.length > PresetConstants.MAX_NAME_LENGTH) {
        name = name.substring(0, PresetConstants.MAX_NAME_LENGTH);
        console.log(`[PresetService] Name truncated to: ${name}`);
        Logger.info(TAG, `Name truncated to: ${name}`);
      }

      // 3. 检查名称是否重复
      console.log('[PresetService] Checking for duplicate name...');
      Logger.info(TAG, 'Checking for duplicate name...');
      const isDuplicate = await this.presetStorage.isNameExists(name);
      console.log(`[PresetService] Duplicate check result: ${isDuplicate}`);
      Logger.info(TAG, `Duplicate check result: ${isDuplicate}`);

      if (isDuplicate) {
        console.log(`[PresetService] Preset name already exists: ${name}`);
        Logger.warn(TAG, `Preset name already exists: ${name}`);
        return SavePresetResult.DUPLICATE;
      }

      // 4. 检查预设数量是否达到上限
      console.log('[PresetService] Checking preset count limit...');
      Logger.info(TAG, 'Checking preset count limit...');
      const presetList = await this.presetStorage.getPresetList();
      console.log(`[PresetService] Current preset count: ${presetList.length}`);
      Logger.info(TAG, `Current preset count: ${presetList.length}`);

      if (presetList.length >= PresetConstants.MAX_PRESET_COUNT) {
        console.log('[PresetService] Preset count limit exceeded');
        Logger.error(TAG, 'Preset count limit exceeded');
        return SavePresetResult.LIMIT_EXCEEDED;
      }

      // 5. 获取当前音量状态
      console.log('[PresetService] Getting current volume state...');
      Logger.info(TAG, 'Getting current volume state...');
      const volumeState = this.getCurrentVolumeState();
      console.log(`[PresetService] Volume state: system=${volumeState.systemVolume}, app=${volumeState.appVolume}, stream=${volumeState.audioStreamVolume}`);
      Logger.info(TAG, `Volume state: system=${volumeState.systemVolume}, app=${volumeState.appVolume}, stream=${volumeState.audioStreamVolume}`);

      // 6. 创建预设对象
      const preset: VolumePreset = {
        id: Date.now().toString(),
        name: name,
        systemVolume: volumeState.systemVolume,
        appVolume: volumeState.appVolume,
        audioStreamVolume: volumeState.audioStreamVolume,
        createTime: Date.now()
      };
      console.log(`[PresetService] Created preset object: ${JSON.stringify(preset)}`);
      Logger.info(TAG, `Created preset object: ${JSON.stringify(preset)}`);

      // 7. 保存预设
      console.log('[PresetService] Calling presetStorage.savePreset...');
      Logger.info(TAG, 'Calling presetStorage.savePreset...');
      const success = await this.presetStorage.savePreset(preset);
      console.log(`[PresetService] savePreset result: ${success}`);
      Logger.info(TAG, `savePreset result: ${success}`);

      if (success) {
        // 触发列表变化回调
        if (this.onPresetListChange) {
          console.log('[PresetService] Triggering preset list change callback');
          Logger.info(TAG, 'Triggering preset list change callback');
          this.onPresetListChange();
        }
        console.log('[PresetService] Returning SUCCESS');
        Logger.info(TAG, 'Returning SUCCESS');
        return SavePresetResult.SUCCESS;
      } else {
        console.error('[PresetService] Failed to save preset');
        Logger.error(TAG, 'Failed to save preset');
        return SavePresetResult.DUPLICATE;
      }
    } catch (error) {
      console.error(`[PresetService] ERROR: ${error}`);
      Logger.error(TAG, `Error saving preset: ${error}`);
      Logger.error(TAG, `Error type: ${typeof error}`);
      Logger.error(TAG, `Error stack: ${new Error().stack}`);
      return SavePresetResult.DUPLICATE;
    }
  }

  /**
   * 覆盖已存在的预设
   * @param name 预设名称
   * @returns 保存是否成功
   */
  public async overwritePreset(name: string): Promise<boolean> {
    try {
      // 获取已存在的预设
      const existingPreset = await this.presetStorage.getPresetByName(name);
      if (!existingPreset) {
        Logger.error(TAG, `Preset not found: ${name}`);
        return false;
      }

      // 获取当前音量状态
      const volumeState = this.getCurrentVolumeState();

      // 更新预设数据
      const updatedPreset: VolumePreset = {
        id: existingPreset.id,
        name: existingPreset.name,
        systemVolume: volumeState.systemVolume,
        appVolume: volumeState.appVolume,
        audioStreamVolume: volumeState.audioStreamVolume,
        createTime: Date.now()
      };

      // 保存预设
      const success = await this.presetStorage.savePreset(updatedPreset);

      if (success) {
        // 触发列表变化回调
        if (this.onPresetListChange) {
          this.onPresetListChange();
        }
        Logger.info(TAG, `Preset overwritten successfully: ${name}`);
        return true;
      }

      return false;
    } catch (error) {
      Logger.error(TAG, `Error overwriting preset: ${error}`);
      return false;
    }
  }

  /**
   * 获取所有预设列表
   * @returns 预设数组
   */
  public async getPresetList(): Promise<VolumePreset[]> {
    return await this.presetStorage.getPresetList();
  }

  /**
   * 应用指定预设
   * @param presetId 预设ID
   * @returns 应用是否成功
   */
  public async applyPreset(presetId: string): Promise<boolean> {
    try {
      // 1. 获取预设数据
      const preset = await this.presetStorage.getPresetById(presetId);
      if (!preset) {
        Logger.error(TAG, `Preset not found: ${presetId}`);
        return false;
      }

      // 2. 应用音量状态
      const state: VolumeState = {
        systemVolume: preset.systemVolume,
        appVolume: preset.appVolume,
        audioStreamVolume: preset.audioStreamVolume
      };
      await this.applyVolumeState(state);

      Logger.info(TAG, `Preset applied successfully: ${preset.name}`);
      return true;
    } catch (error) {
      Logger.error(TAG, `Error applying preset: ${error}`);
      return false;
    }
  }

  /**
   * 删除指定预设
   * @param presetId 预设ID
   * @returns 删除是否成功
   */
  public async deletePreset(presetId: string): Promise<boolean> {
    try {
      const success = await this.presetStorage.deletePreset(presetId);

      if (success) {
        // 触发列表变化回调
        if (this.onPresetListChange) {
          this.onPresetListChange();
        }
        Logger.info(TAG, `Preset deleted successfully: ${presetId}`);
        return true;
      }

      return false;
    } catch (error) {
      Logger.error(TAG, `Error deleting preset: ${error}`);
      return false;
    }
  }

  /**
   * 检查预设名称是否重复
   * @param name 预设名称
   * @returns 是否重复
   */
  public async checkNameDuplicate(name: string): Promise<boolean> {
    return await this.presetStorage.isNameExists(name);
  }

  /**
   * 注册预设列表变化监听
   * @param callback 变化回调函数
   */
  public setOnPresetListChange(callback: () => void): void {
    this.onPresetListChange = callback;
  }
}
