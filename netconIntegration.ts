import * as parsers from "csgo-buddy/src/parsers/index";
import * as services from "csgo-buddy/src/services/index";
import * as types from "csgo-buddy/src/types/index";

const netcon = new services.Client(2323, '127.0.0.1');

netcon.connect();

netcon.send("crosshair 0");
