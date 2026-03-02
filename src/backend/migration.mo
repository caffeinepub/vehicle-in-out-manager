module {
  type OldActor = {
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
    recordChallanNumbers : [Text];
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      recordChallanNumbers = [];
    };
  };
};
