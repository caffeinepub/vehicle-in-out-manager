import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type VehicleRecord = {
    id : Nat;
    vehicleNumber : Text;
    action : Text;
    date : Text;
    time : Text;
    timestamp : Int;
  };

  var nextId = 0;
  let records = Map.empty<Nat, VehicleRecord>();

  public shared ({ caller }) func addRecord(vehicleNumber : Text, action : Text, date : Text, time : Text) : async Nat {
    // Validate action
    if (action != "IN" and action != "OUT") {
      Runtime.trap("Action must be 'IN' or 'OUT'");
    };

    let record : VehicleRecord = {
      id = nextId;
      vehicleNumber;
      action;
      date;
      time;
      timestamp = Time.now();
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
    if (not records.containsKey(id)) {
      Runtime.trap("Record does not exist");
    };
    records.remove(id);
  };
};
