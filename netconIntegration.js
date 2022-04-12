import * as services from "csgo-buddy/src/services/index";
const netcon = new services.Client(2323, '127.0.0.1');
netcon.connect();
netcon.send("crosshair 0");
//# sourceMappingURL=netconIntegration.js.map