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

/**
 * 音量预设数据模型
 * 用于存储一组完整的音量配置，包括系统音量、应用音量和音频流音量
 */
export interface VolumePreset {
  /** 预设唯一标识（基于时间戳生成） */
  id: string;

  /** 预设名称（用户自定义） */
  name: string;

  /** 系统音量值（范围：0-15） */
  systemVolume: number;

  /** 应用音量百分比（范围：0-100） */
  appVolume: number;

  /** 音频流音量（范围：0-1，浮点数） */
  audioStreamVolume: number;

  /** 创建时间戳（毫秒） */
  createTime: number;
}

/**
 * 预设列表项展示数据（用于UI渲染）
 * 包含预设数据和操作回调函数
 */
export interface PresetListItemData {
  /** 预设数据 */
  preset: VolumePreset;

  /** 应用预设回调函数 */
  onApply: () => void;

  /** 删除预设回调函数 */
  onDelete: () => void;
}
