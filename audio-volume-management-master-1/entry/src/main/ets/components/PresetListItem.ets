/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { VolumePreset } from '../model/VolumePreset';
import { PresetConstants } from '../common/PresetConstants';

/**
 * 预设列表项组件
 * 展示单个预设的信息和操作按钮
 * 包含预设名称、应用按钮和删除按钮
 */
@Component
export struct PresetListItem {
  /** 预设数据 */
  @Prop preset: VolumePreset;

  /** 应用回调函数 */
  onApply: () => void = () => {};

  /** 删除回调函数 */
  onDelete: () => void = () => {};

  build() {
    Row() {
      // 预设名称
      Text(this.preset.name)
        .fontSize(16)
        .fontColor(Color.Black)
        .fontWeight(FontWeight.Normal)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .layoutWeight(1)

      // 操作按钮区域
      Row() {
        // 应用按钮
        Button('应用')
          .fontSize(12)
          .fontColor('#007DFF')
          .backgroundColor('#E6F0FF')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(28)
          .padding({ left: 10, right: 10 })
          .onClick(() => {
            this.onApply();
          })

        // 删除按钮
        Button('删除')
          .fontSize(12)
          .fontColor('#E84026')
          .backgroundColor('#FFF0ED')
          .borderRadius(PresetConstants.BORDER_RADIUS)
          .height(28)
          .padding({ left: 10, right: 10 })
          .margin({ left: 8 })
          .onClick(() => {
            this.onDelete();
          })
      }
    }
    .width('100%')
    .height(PresetConstants.LIST_ITEM_HEIGHT)
    .padding({ left: PresetConstants.PANEL_PADDING, right: PresetConstants.PANEL_PADDING })
    .backgroundColor(Color.White)
    .borderRadius(PresetConstants.BORDER_RADIUS)
    .shadow({
      radius: 2,
      color: '#1F000000',
      offsetX: 0,
      offsetY: 1
    })
  }
}