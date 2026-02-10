import Dexie, { type Table } from 'dexie';
import { 
  RiceCrop, 
  Season, 
  FarmingSchedule, 
  GrowthTracking, 
  CostItem, 
  HarvestRecord,
  WeighingRecord
} from '@/models/rice-farming';

export class LocalFarmingDB extends Dexie {
  riceCrops!: Table<RiceCrop, number>;
  seasons!: Table<Season, number>;
  farmingSchedules!: Table<FarmingSchedule, number>;
  growthTrackings!: Table<GrowthTracking, number>;
  costItems!: Table<CostItem, number>;
  harvestRecords!: Table<HarvestRecord, number>;
  weighingRecords!: Table<WeighingRecord, number>;

  constructor() {
    super('XanhAgLocalFarmingDB');
    this.version(2).stores({
      riceCrops: '++id, season_id, field_name, rice_variety, status',
      seasons: '++id, name, year',
      farmingSchedules: '++id, rice_crop_id, schedule_date, status',
      growthTrackings: '++id, rice_crop_id, tracking_date',
      costItems: '++id, rice_crop_id, category_id, expense_date',
      harvestRecords: '++id, rice_crop_id, harvest_date',
      weighingRecords: '++id, rice_crop_id, weighing_date'
    });
  }
}

export const localDB = new LocalFarmingDB();
