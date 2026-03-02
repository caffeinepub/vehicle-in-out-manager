import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Migration "migration";
import Runtime "mo:core/Runtime";

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
    challanNumber : Text;
  };

  stable var nextId = 0;
  stable var recordIds : [Nat] = [];
  stable var recordVehicleNumbers : [Text] = [];
  stable var recordActions : [Text] = [];
  stable var recordDates : [Text] = [];
  stable var recordTimes : [Text] = [];
  stable var recordSuppliers : [Text] = [];
  stable var recordUnits : [Nat] = [];
  stable var recordDriverNames : [Text] = [];
  stable var recordChallanNumbers : [Text] = [];

  public shared ({ caller }) func addRecord(
    vehicleNumber : Text,
    action : Text,
    date : Text,
    time : Text,
    supplier : Text,
    units : Nat,
    driverName : Text,
    challanNumber : Text,
  ) : async Nat {
    if (action != "IN" and action != "OUT") {
      Runtime.trap("Action must be \\\"IN\\\" or \\\"OUT\\\"");
    };

    recordIds := recordIds.concat([nextId]);
    recordVehicleNumbers := recordVehicleNumbers.concat([vehicleNumber]);
    recordActions := recordActions.concat([action]);
    recordDates := recordDates.concat([date]);
    recordTimes := recordTimes.concat([time]);
    recordSuppliers := recordSuppliers.concat([supplier]);
    recordUnits := recordUnits.concat([units]);
    recordDriverNames := recordDriverNames.concat([driverName]);
    recordChallanNumbers := recordChallanNumbers.concat([challanNumber]);

    let currentId = nextId;
    nextId += 1;
    currentId;
  };

  public query ({ caller }) func getAllRecords() : async [VehicleRecord] {
    let length = recordIds.size();

    Array.tabulate<VehicleRecord>(
      length,
      func(i) {
        {
          id = recordIds[i];
          vehicleNumber = recordVehicleNumbers[i];
          action = recordActions[i];
          date = recordDates[i];
          time = recordTimes[i];
          supplier = recordSuppliers[i];
          units = recordUnits[i];
          driverName = recordDriverNames[i];
          challanNumber = recordChallanNumbers[i];
        };
      },
    );
  };

  public shared ({ caller }) func deleteRecord(id : Nat) : async () {
    let indexOpt = recordIds.findIndex(func(x) { x == id });
    switch (indexOpt) {
      case (null) {
        Runtime.trap("Record does not exist");
      };
      case (?index) {
        let length = recordIds.size();

        recordIds := Array.tabulate(length - 1, func(i) { if (i < index) { recordIds[i] } else { recordIds[i + 1] } });
        recordVehicleNumbers := Array.tabulate(length - 1, func(i) { if (i < index) { recordVehicleNumbers[i] } else { recordVehicleNumbers[i + 1] } });
        recordActions := Array.tabulate(length - 1, func(i) { if (i < index) { recordActions[i] } else { recordActions[i + 1] } });
        recordDates := Array.tabulate(length - 1, func(i) { if (i < index) { recordDates[i] } else { recordDates[i + 1] } });
        recordTimes := Array.tabulate(length - 1, func(i) { if (i < index) { recordTimes[i] } else { recordTimes[i + 1] } });
        recordSuppliers := Array.tabulate(length - 1, func(i) { if (i < index) { recordSuppliers[i] } else { recordSuppliers[i + 1] } });
        recordUnits := Array.tabulate(length - 1, func(i) { if (i < index) { recordUnits[i] } else { recordUnits[i + 1] } });
        recordDriverNames := Array.tabulate(length - 1, func(i) { if (i < index) { recordDriverNames[i] } else { recordDriverNames[i + 1] } });
        recordChallanNumbers := Array.tabulate(length - 1, func(i) { if (i < index) { recordChallanNumbers[i] } else { recordChallanNumbers[i + 1] } });
      };
    };
  };
};
