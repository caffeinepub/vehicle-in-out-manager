import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type OldVehicleRecord = {
    id : Nat;
    vehicleNumber : Text;
    action : Text;
    date : Text;
    time : Text;
    supplier : Text;
    units : Nat;
    driverName : Text;
  };

  type OldActor = {
    nextId : Nat;
    records : Map.Map<Nat, OldVehicleRecord>;
  };

  type NewActor = {
    nextId : Nat;
    recordIds : [Nat];
    recordVehicleNumbers : [Text];
    recordActions : [Text];
    recordDates : [Text];
    recordTimes : [Text];
    recordSuppliers : [Text];
    recordUnits : [Nat];
    recordDriverNames : [Text];
  };

  public func run(old : OldActor) : NewActor {
    let allRecords = old.records.toArray();
    let length = allRecords.size();
    var recordIds : [Nat] = [];
    var recordVehicleNumbers : [Text] = [];
    var recordActions : [Text] = [];
    var recordDates : [Text] = [];
    var recordTimes : [Text] = [];
    var recordSuppliers : [Text] = [];
    var recordUnits : [Nat] = [];
    var recordDriverNames : [Text] = [];

    for (i in Nat.range(0, length)) {
      recordIds := recordIds.concat([allRecords[i].0]);
      recordVehicleNumbers := recordVehicleNumbers.concat([allRecords[i].1.vehicleNumber]);
      recordActions := recordActions.concat([allRecords[i].1.action]);
      recordDates := recordDates.concat([allRecords[i].1.date]);
      recordTimes := recordTimes.concat([allRecords[i].1.time]);
      recordSuppliers := recordSuppliers.concat([allRecords[i].1.supplier]);
      recordUnits := recordUnits.concat([allRecords[i].1.units]);
      recordDriverNames := recordDriverNames.concat([allRecords[i].1.driverName]);
    };

    {
      nextId = old.nextId;
      recordIds;
      recordVehicleNumbers;
      recordActions;
      recordDates;
      recordTimes;
      recordSuppliers;
      recordUnits;
      recordDriverNames;
    };
  };
};
