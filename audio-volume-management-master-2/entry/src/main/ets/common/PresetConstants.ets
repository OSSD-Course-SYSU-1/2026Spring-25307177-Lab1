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
 * 预设功能相关常量定义
 * 包含存储配置、布局参数、限制条件等常量
 */
export class PresetConstants {
  /** distributedKVStore 数据库标识 */
  static readonly KV_STORE_ID: string = 'volume_preset_kvstore';

  /** distributedKVStore 数据库组标识 */
  static readonly KV_BUNDLE_NAME: string = 'com.example.audiostreamvolumemanagement';

  /** 预设列表存储键 */
  static readonly PRESET_LIST_KEY: string = 'preset_list';

  /** 最大预设数量限制 */
  static readonly MAX_PRESET_COUNT: number = 20;

  /** 响应式布局断点：宽屏阈值（vp） */
  static readonly TABLET_BREAKPOINT: number = 600;

  /** 预设名称最大长度 */
  static readonly MAX_NAME_LENGTH: number = 20;

  /** 面板内边距（vp） */
  static readonly PANEL_PADDING: number = 16;

  /** 列表项高度（vp） */
  static readonly LIST_ITEM_HEIGHT: number = 56;

  /** 图标尺寸（vp） */
  static readonly ICON_SIZE: number = 24;

  /** 列表间距（vp） */
  static readonly LIST_SPACE: number = 12;

  /** 按钮间距（vp） */
  static readonly BUTTON_MARGIN: number = 16;

  /** 圆角半径（vp） */
  static readonly BORDER_RADIUS: number = 8;
}
