import preferences from "@ohos:data.preferences";
import type { VolumePreset } from '../model/VolumePreset';
import { PresetConstants } from "@normalized:N&&&entry/src/main/ets/common/PresetConstants&";
import { Logger } from "@normalized:N&&&entry/src/main/ets/utils/Logger&";
const TAG = 'PresetStorage';
/**
 * 预设存储服务
 * 负责预设数据的本地持久化操作
 * 使用 @kit.ArkData.preferences 实现数据存储
 */
export class PresetStorage {
    /** 单例实例 */
    private static instance: PresetStorage | null = null;
    /** Preferences存储实例 */
    private preferencesStore: preferences.Preferences | null = null;
    /**
     * 私有构造函数，实现单例模式
     */
    private constructor() {
    }
    /**
     * 获取单例实例
     * @returns PresetStorage实例
     */
    public static getInstance(): PresetStorage {
        if (!PresetStorage.instance) {
            PresetStorage.instance = new PresetStorage();
        }
        return PresetStorage.instance;
    }
    /**
     * 初始化Preferences存储
     * @param context 应用上下文
     */
    public async init(context: Context): Promise<void> {
        Logger.info(TAG, 'Initializing PresetStorage...');
        try {
            // 获取Preferences存储实例
            Logger.info(TAG, `Getting preferences with name: ${PresetConstants.PRESET_STORE_NAME}`);
            this.preferencesStore = await preferences.getPreferences(context, PresetConstants.PRESET_STORE_NAME);
            Logger.info(TAG, 'PresetStorage initialized successfully');
            // 验证preferencesStore是否可用
            if (this.preferencesStore) {
                Logger.info(TAG, 'PreferencesStore is ready, type: ' + typeof this.preferencesStore);
            }
            else {
                Logger.error(TAG, 'PreferencesStore is null after initialization');
            }
        }
        catch (error) {
            Logger.error(TAG, `Failed to initialize PresetStorage: ${error}`);
            Logger.error(TAG, `Error stack: ${new Error().stack}`);
        }
    }
    /**
     * 检查Preferences是否已初始化
     * @returns 是否已初始化
     */
    public isInitialized(): boolean {
        const initialized = this.preferencesStore !== null;
        Logger.info(TAG, `isInitialized check: ${initialized}`);
        return initialized;
    }
    /**
     * 获取所有预设列表
     * @returns 预设数组，按创建时间倒序排列
     */
    public async getPresetList(): Promise<VolumePreset[]> {
        try {
            if (!this.preferencesStore) {
                Logger.error(TAG, 'PreferencesStore is not initialized');
                return [];
            }
            // 从Preferences中读取预设列表JSON字符串
            const presetListJson = await this.preferencesStore.get(PresetConstants.PRESET_LIST_KEY, '[]') as string;
            const presetList: VolumePreset[] = JSON.parse(presetListJson);
            // 按创建时间倒序排列（最新的在前）
            presetList.sort((a, b) => b.createTime - a.createTime);
            Logger.info(TAG, `Loaded ${presetList.length} presets`);
            return presetList;
        }
        catch (error) {
            Logger.error(TAG, `Failed to get preset list: ${error}`);
            return [];
        }
    }
    /**
     * 保存预设（新增或更新）
     * @param preset 预设数据
     * @returns 保存是否成功
     */
    public async savePreset(preset: VolumePreset): Promise<boolean> {
        Logger.info(TAG, `savePreset called for: ${preset.name}`);
        Logger.info(TAG, `Preset data: ${JSON.stringify(preset)}`);
        try {
            if (!this.preferencesStore) {
                Logger.error(TAG, 'PreferencesStore is not initialized');
                Logger.error(TAG, 'Call init() before using savePreset()');
                return false;
            }
            Logger.info(TAG, 'PreferencesStore is available, getting current preset list...');
            // 获取当前预设列表
            const presetList = await this.getPresetList();
            Logger.info(TAG, `Current preset list has ${presetList.length} items`);
            // 查找是否存在相同ID的预设
            const existingIndex = presetList.findIndex(p => p.id === preset.id);
            Logger.info(TAG, `Existing index: ${existingIndex}`);
            if (existingIndex >= 0) {
                // 更新现有预设
                presetList[existingIndex] = preset;
                Logger.info(TAG, 'Updating existing preset');
            }
            else {
                // 添加新预设
                presetList.push(preset);
                Logger.info(TAG, 'Adding new preset');
            }
            // 序列化为JSON并保存
            Logger.info(TAG, 'Serializing preset list to JSON...');
            const presetListJson = JSON.stringify(presetList);
            Logger.info(TAG, `JSON length: ${presetListJson.length}, content: ${presetListJson.substring(0, 100)}...`);
            Logger.info(TAG, 'Calling preferences.put...');
            await this.preferencesStore.put(PresetConstants.PRESET_LIST_KEY, presetListJson);
            Logger.info(TAG, 'preferences.put completed');
            Logger.info(TAG, 'Calling preferences.flush...');
            await this.preferencesStore.flush();
            Logger.info(TAG, 'preferences.flush completed');
            Logger.info(TAG, `Preset saved successfully: ${preset.name}`);
            return true;
        }
        catch (error) {
            Logger.error(TAG, `Failed to save preset: ${error}`);
            Logger.error(TAG, `Error type: ${typeof error}`);
            Logger.error(TAG, `Error details: ${JSON.stringify(error)}`);
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
            if (!this.preferencesStore) {
                Logger.error(TAG, 'PreferencesStore is not initialized');
                return false;
            }
            // 获取当前预设列表
            const presetList = await this.getPresetList();
            // 过滤掉要删除的预设
            const newList = presetList.filter(p => p.id !== presetId);
            // 序列化为JSON并保存
            const presetListJson = JSON.stringify(newList);
            await this.preferencesStore.put(PresetConstants.PRESET_LIST_KEY, presetListJson);
            await this.preferencesStore.flush();
            Logger.info(TAG, `Preset deleted successfully: ${presetId}`);
            return true;
        }
        catch (error) {
            Logger.error(TAG, `Failed to delete preset: ${error}`);
            return false;
        }
    }
    /**
     * 检查预设名称是否存在
     * @param name 预设名称
     * @returns 是否存在重名
     */
    public async isNameExists(name: string): Promise<boolean> {
        try {
            const presetList = await this.getPresetList();
            return presetList.some(p => p.name === name);
        }
        catch (error) {
            Logger.error(TAG, `Failed to check name existence: ${error}`);
            return false;
        }
    }
    /**
     * 根据名称获取预设
     * @param name 预设名称
     * @returns 预设数据或null
     */
    public async getPresetByName(name: string): Promise<VolumePreset | null> {
        try {
            const presetList = await this.getPresetList();
            return presetList.find(p => p.name === name) || null;
        }
        catch (error) {
            Logger.error(TAG, `Failed to get preset by name: ${error}`);
            return null;
        }
    }
    /**
     * 根据ID获取预设
     * @param presetId 预设ID
     * @returns 预设数据或null
     */
    public async getPresetById(presetId: string): Promise<VolumePreset | null> {
        try {
            const presetList = await this.getPresetList();
            return presetList.find(p => p.id === presetId) || null;
        }
        catch (error) {
            Logger.error(TAG, `Failed to get preset by id: ${error}`);
            return null;
        }
    }
}
