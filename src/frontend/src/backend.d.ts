import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VehicleRecord {
    id: bigint;
    action: string;
    supplier: string;
    date: string;
    vehicleNumber: string;
    time: string;
    units: bigint;
    driverName: string;
}
export interface backendInterface {
    addRecord(vehicleNumber: string, action: string, date: string, time: string, supplier: string, units: bigint, driverName: string): Promise<bigint>;
    deleteRecord(id: bigint): Promise<void>;
    getAllRecords(): Promise<Array<VehicleRecord>>;
}
