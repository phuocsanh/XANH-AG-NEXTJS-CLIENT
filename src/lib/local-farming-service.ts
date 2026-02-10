import { localDB } from './local-db';
import { 
  RiceCrop, 
  Season, 
  FarmingSchedule, 
  GrowthTracking, 
  CostItem, 
  HarvestRecord 
} from '@/models/rice-farming';

export const localFarmingService = {
  // Rice Crops
  createRiceCrop: async (data: any) => {
    return await localDB.riceCrops.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  getAllRiceCrops: async () => {
    const crops = await localDB.riceCrops.toArray();
    // Map with seasons if available
    for (const crop of crops) {
      if (crop.season_id) {
        crop.season = await localDB.seasons.get(crop.season_id);
      }
    }
    return crops;
  },

  getRiceCropById: async (id: number) => {
    const crop = await localDB.riceCrops.get(id);
    if (crop && crop.season_id) {
      crop.season = await localDB.seasons.get(crop.season_id);
    }
    return crop;
  },

  updateRiceCrop: async (id: number, data: any) => {
    return await localDB.riceCrops.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  deleteRiceCrop: async (id: number) => {
    await localDB.riceCrops.delete(id);
    // Delete related data
    await localDB.farmingSchedules.where('rice_crop_id').equals(id).delete();
    await localDB.growthTrackings.where('rice_crop_id').equals(id).delete();
    await localDB.costItems.where('rice_crop_id').equals(id).delete();
    await localDB.harvestRecords.where('rice_crop_id').equals(id).delete();
  },

  // Seasons (Local mock for guest)
  getAllSeasons: async () => {
    return await localDB.seasons.toArray();
  },

  createSeason: async (data: any) => {
    return await localDB.seasons.add(data);
  },

  // Schedules
  getSchedulesByCropId: async (cropId: number) => {
    return await localDB.farmingSchedules.where('rice_crop_id').equals(cropId).toArray();
  },

  createSchedule: async (data: any) => {
    return await localDB.farmingSchedules.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  updateSchedule: async (id: number, data: any) => {
    return await localDB.farmingSchedules.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  deleteSchedule: async (id: number) => {
    return await localDB.farmingSchedules.delete(id);
  },

  // Growth Trackings
  getTrackingsByCropId: async (cropId: number) => {
    return await localDB.growthTrackings.where('rice_crop_id').equals(cropId).toArray();
  },

  createTracking: async (data: any) => {
    return await localDB.growthTrackings.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  updateTracking: async (id: number, data: any) => {
    return await localDB.growthTrackings.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  deleteTracking: async (id: number) => {
    return await localDB.growthTrackings.delete(id);
  },

  // Cost Items
  getCostsByCropId: async (cropId: number) => {
    return await localDB.costItems.where('rice_crop_id').equals(cropId).toArray();
  },

  createCostItem: async (data: any) => {
    return await localDB.costItems.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  updateCostItem: async (id: number, data: any) => {
    return await localDB.costItems.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  deleteCostItem: async (id: number) => {
    return await localDB.costItems.delete(id);
  },

  // Harvest Records
  getHarvestByCropId: async (cropId: number) => {
    return await localDB.harvestRecords.where('rice_crop_id').equals(cropId).toArray();
  },

  createHarvestRecord: async (data: any) => {
    return await localDB.harvestRecords.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  updateHarvestRecord: async (id: number, data: any) => {
    return await localDB.harvestRecords.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  deleteHarvestRecord: async (id: number) => {
    return await localDB.harvestRecords.delete(id);
  },

  // Weighing Records
  createWeighingRecord: async (data: any) => {
    return await localDB.weighingRecords.add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  getAllWeighingRecords: async () => {
    return await localDB.weighingRecords.orderBy('weighing_date').reverse().toArray();
  },

  deleteWeighingRecord: async (id: number) => {
    return await localDB.weighingRecords.delete(id);
  }
};
