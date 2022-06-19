import {TelecommandConfig, TelecommandWidgetConfig} from "./Telecommand";

/**
 * Type definition for the incoming InnoCube Apps
 */
export type AppConfig = {
	id: string;
	name: string;
	telecommands: { [key: string]: TelecommandConfig };
};

/**
 * Type definition for the parsed App
 */
export type AppWidgetConfig = {
	id: string;
	name: string;
	telecommands: TelecommandWidgetConfig[];
};
