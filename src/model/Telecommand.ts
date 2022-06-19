/**
 * Type definition for the incoming InnoCube Telecommands
 */
export type TelecommandConfig = {
	id: number;
	fields?: { [key: string]: string };
};

/**
 * Type definition for the parsed InnoCube Telecommand
 */
export type TelecommandWidgetConfig = {
	id: number;
	name: string;
	fields?: {
		name: string;
		type: string;
	}[];
};
