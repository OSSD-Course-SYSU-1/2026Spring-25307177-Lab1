import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import ConfigurationConstant from "@ohos:app.ability.ConfigurationConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type { Permissions } from "@ohos:abilityAccessCtrl";
import { Logger } from "@normalized:N&&&entry/src/main/ets/utils/Logger&";
import { PresetStorage } from "@normalized:N&&&entry/src/main/ets/storage/PresetStorage&";
const DOMAIN = 0x0000;
const TAG = 'EntryAbility';
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        // 初始化预设存储（异步操作）
        PresetStorage.getInstance().init(this.context).then(() => {
            hilog.info(DOMAIN, 'testTag', '%{public}s', 'PresetStorage initialized successfully');
        }).catch((error: Error) => {
            hilog.error(DOMAIN, 'testTag', 'Failed to initialize PresetStorage. Cause: %{public}s', error.message);
        });
        // 请求分布式数据同步权限
        this.requestDistributedDataSyncPermission();
        try {
            this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
        }
        catch (err) {
            hilog.error(DOMAIN, 'testTag', 'Failed to set colorMode. Cause: %{public}s', JSON.stringify(err));
        }
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');
    }
    /**
     * 请求分布式数据同步权限
     * ohos.permission.DISTRIBUTED_DATASYNC 为 user_grant 类型权限，需在运行时动态请求
     */
    private requestDistributedDataSyncPermission(): void {
        const permission: Permissions = 'ohos.permission.DISTRIBUTED_DATASYNC';
        const atManager = abilityAccessCtrl.createAtManager();
        atManager.checkAccessToken(this.context.applicationInfo.accessTokenId, permission).then((result) => {
            if (result === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
                Logger.info(TAG, 'DISTRIBUTED_DATASYNC permission already granted');
            }
            else {
                Logger.info(TAG, 'Requesting DISTRIBUTED_DATASYNC permission...');
                // 通过 AppStorage 通知 UI 层请求权限（因为 requestPermissionsFromUser 需要 UI 上下文）
                AppStorage.setOrCreate('needRequestDistributedPermission', true);
            }
        }).catch((error: Error) => {
            Logger.error(TAG, `Failed to check DISTRIBUTED_DATASYNC permission: ${error.message}`);
        });
    }
    onDestroy(): void {
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        // Main window is created, set main page for this ability
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageCreate');
        windowStage.loadContent('pages/Index', (err) => {
            if (err.code) {
                hilog.error(DOMAIN, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err));
                return;
            }
            windowStage.getMainWindow().then((window: window.Window) => {
                window.setWindowLayoutFullScreen(true).catch(() => {
                    Logger.error('setWindowLayoutFullScreen error!');
                });
                AppStorage.setOrCreate('windowClass', window);
                // 在窗口创建后请求分布式数据同步权限
                this.requestPermissionFromUI(window);
            }).catch(() => {
                Logger.error('getMainWindow error!');
            });
            hilog.info(DOMAIN, 'testTag', 'Succeeded in loading the content.');
        });
    }
    /**
     * 通过 AtManager 请求分布式数据同步权限
     * @param win 窗口实例
     */
    private requestPermissionFromUI(win: window.Window): void {
        const permission: Permissions = 'ohos.permission.DISTRIBUTED_DATASYNC';
        const atManager = abilityAccessCtrl.createAtManager();
        atManager.checkAccessToken(this.context.applicationInfo.accessTokenId, permission).then((result) => {
            if (result !== abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
                Logger.info(TAG, 'Requesting DISTRIBUTED_DATASYNC permission');
                atManager.requestPermissionsFromUser(this.context, [permission]).then((data) => {
                    Logger.info(TAG, `Permission request result: ${JSON.stringify(data.authResults)}`);
                }).catch((error: Error) => {
                    Logger.error(TAG, `Failed to request permission: ${error.message}`);
                });
            }
        }).catch((error: Error) => {
            Logger.error(TAG, `Failed to check permission in UI context: ${error.message}`);
        });
    }
    onWindowStageDestroy(): void {
        // Main window is destroyed, release UI related resources
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        // Ability has brought to foreground
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onForeground');
    }
    onBackground(): void {
        // Ability has back to background
        hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onBackground');
    }
}
