import distributedKVStore from "@ohos:data.distributedKVStore";
import type { VolumePreset } from '../model/VolumePreset';
import { PresetConstants } from "@normalized:N&&&entry/src/main/ets/common/PresetConstants&";
import { Logger } from "@normalized:N&&&entry/src/main/ets/utils/Logger&";
const TAG = 'PresetStorage';
/**
 * 预设存储服务
 * 负责预设数据的持久化操作
 * 使用 @kit.ArkData.distributedKVStore 实现分布式数据存储
 * 多设备登录同一华为账号时，预设数据可自动同步
 */
export class PresetStorage {
    /** 单例实例 */
    private static instance: PresetStorage | null = null;
    /** distributedKVStore 实例 */
    private kvStore: distributedKVStore.SingleKVStore | null = null;
    /** 数据变化订阅回调 */
    private dataChangeCallback: (() => void) | null = null;
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
     * 初始化 distributedKVStore 存储
     * @param context 应用上下文
     */
    public async init(context: Context): Promise<void> {
        Logger.info(TAG, 'Initializing PresetStorage with distributedKVStore...');
        try {
            // 创建 KVManager 配置
            const kvManagerConfig: distributedKVStore.KVManagerConfig = {
                bundleName: PresetConstants.KV_BUNDLE_NAME,
                context: context
            };
            // 创建 KVManager
            const kvManager = distributedKVStore.createKVManager(kvManagerConfig);
            Logger.info(TAG, 'KVManager created successfully');
            // 创建 KVStore 配置（使用 SINGLE_VERSION 模式，支持分布式同步）
            const options: distributedKVStore.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: true,
                kvStoreType: distributedKVStore.KVStoreType.SINGLE_VERSION,
                securityLevel: distributedKVStore.SecurityLevel.S1
            };
            // 创建或打开 KVStore
            this.kvStore = await kvManager.getKVStore<distributedKVStore.SingleKVStore>(PresetConstants.KV_STORE_ID, options);
            Logger.info(TAG, 'PresetStorage initialized successfully with distributedKVStore');
            // 注册数据变化监听（用于分布式同步时自动刷新UI）
            this.registerDataChangeObserver();
        }
        catch (error) {
            Logger.error(TAG, `Failed to initialize PresetStorage: ${error}`);
            Logger.error(TAG, `Error stack: ${new Error().stack}`);
        }
    }
    /**
     * 注册分布式数据变化监听
     * 当其他设备同步数据过来时，自动触发回调刷新UI
     */
    private registerDataChangeObserver(): void {
        if (!this.kvStore) {
            Logger.error(TAG, 'Cannot register data change observer: kvStore is null');
            return;
        }
        try {
            this.kvStore.on('dataChange', distributedKVStore.SubscribeType.SUBSCRIBE_TYPE_ALL, (data: distributedKVStore.ChangeNotification) => {
                Logger.info(TAG, `Data change received, updateCount: ${data.updateEntries.length}, ` +
                    `deleteCount: ${data.deleteEntries.length}, insertCount: ${data.insertEntries.length}`);
                // 触发UI刷新回调
                if (this.dataChangeCallback) {
                    this.dataChangeCallback();
                }
            });
            Logger.info(TAG, 'Data change observer registered successfully');
        }
        catch (error) {
            Logger.error(TAG, `Failed to register data change observer: ${error}`);
        }
    }
    /**
     * 设置数据变化回调（供外部注册UI刷新逻辑）
     * @param callback 数据变化时的回调函数
     */
    public setDataChangeCallback(callback: () => void): void {
        this.dataChangeCallback = callback;
        Logger.info(TAG, 'Data change callback set');
    }
    /**
     * 检查 KVStore 是否已初始化
     * @returns 是否已初始化
     */
    public isInitialized(): boolean {
        const initialized = this.kvStore !== null;
        Logger.info(TAG, `isInitialized check: ${initialized}`);
        return initialized;
    }
    /**
     * 获取所有预设列表
     * @returns 预设数组，按创建时间倒序排列
     */
    public async getPresetList(): Promise<VolumePreset[]> {
        try {
            if (!this.kvStore) {
                Logger.error(TAG, 'KVStore is not initialized');
                return [];
            }
            // 从 KVStore 中读取预设列表 JSON 字符串
            let presetListJson: string = '[]';
            try {
                const value = await this.kvStore.get(PresetConstants.PRESET_LIST_KEY);
                if (typeof value === 'string') {
                    presetListJson = value;
                }
            }
            catch (e) {
                // key 不存在时 get 会抛出异常，使用默认空列表
                Logger.info(TAG, 'Preset list key not found, using default empty list');
            }
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
            if (!this.kvStore) {
                Logger.error(TAG, 'KVStore is not initialized');
                Logger.error(TAG, 'Call init() before using savePreset()');
                return false;
            }
            Logger.info(TAG, 'KVStore is available, getting current preset list...');
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
            Logger.info(TAG, 'Calling kvStore.put...');
            await this.kvStore.put(PresetConstants.PRESET_LIST_KEY, presetListJson);
            Logger.info(TAG, 'kvStore.put completed');
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
            if (!this.kvStore) {
                Logger.error(TAG, 'KVStore is not initialized');
                return false;
            }
            // 获取当前预设列表
            const presetList = await this.getPresetList();
            // 过滤掉要删除的预设
            const newList = presetList.filter(p => p.id !== presetId);
            // 序列化为JSON并保存
            const presetListJson = JSON.stringify(newList);
            await this.kvStore.put(PresetConstants.PRESET_LIST_KEY, presetListJson);
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
