import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Migration "migration";

(with migration = Migration.run)
actor {
  type VehicleRecord = {
    id : Nat;
    vehicleNumber : Text;
    action : Text;
    date : Text;
    time : Text;
    supplier : Text;
    units : Nat;
    driverName : Text;
  };

  var nextId = 0;
  let records = Map.empty<Nat, VehicleRecord>();

  public shared ({ caller }) func addRecord(
    vehicleNumber : Text,
    action : Text,
    date : Text,
    time : Text,
    supplier : Text,
    units : Nat,
    driverName : Text,
  ) : async Nat {
    if (action != "IN" and action != "OUT") {
      Runtime.trap("Action must be \\\"IN\\\" or \\\"OUT\\\"");
    };

    let record : VehicleRecord = {
      id = nextId;
      vehicleNumber;
      action;
      date;
      time;
      supplier;
      units;
      driverName;
    };

    records.add(nextId, record);
    let currentId = nextId;
    nextId += 1;
    currentId;
  };

  public query ({ caller }) func getAllRecords() : async [VehicleRecord] {
    records.values().toArray();
  };

  public shared ({ caller }) func deleteRecord(id : Nat) : async () {
    switch (records.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?_) {
        records.remove(id);
      };
    };
  };
};
