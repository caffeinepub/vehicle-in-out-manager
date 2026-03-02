import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Old record without driverName
  type OldVehicleRecord = {
    id : Nat;
    vehicleNumber : Text;
    action : Text;
    date : Text;
    time : Text;
    supplier : Text;
    units : Nat;
  };

  // Old actor type
  type OldActor = {
    records : Map.Map<Nat, OldVehicleRecord>;
    nextId : Nat;
  };

  // New record type with driverName
  type NewVehicleRecord = {
    id : Nat;
    vehicleNumber : Text;
    action : Text;
    date : Text;
    time : Text;
    supplier : Text;
    units : Nat;
    driverName : Text; // new field
  };

  // New actor type
  type NewActor = {
    records : Map.Map<Nat, NewVehicleRecord>;
    nextId : Nat;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newRecords = old.records.map<Nat, OldVehicleRecord, NewVehicleRecord>(
      func(_id, oldRecord) {
        { oldRecord with driverName = "" }; // Default to empty string for old records
      }
    );
    { old with records = newRecords };
  };
};
