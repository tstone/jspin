import { Machine, Neutron } from "@jspin/core";
import { ioNet } from "./ionet";

(async () => {
  const machine = new Machine({
    mainboard: new Neutron({
      ioPort: '/dev/ttyACM0',
      expPort: '/dev/ttyACM1',
    }),
    ioNet,
    actors: [],
  });
  await machine.run();
})();
