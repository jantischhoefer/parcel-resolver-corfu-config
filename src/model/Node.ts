import {AppWidgetConfig} from "./App";

/**
 * Type definition for the incoming InnoCube Nodes
 */
export type NodeConfig = {
	id: string;
	name: string;
	apps: string[];
};

/**
 * Type definition for the parsed Node
 */
export type NodeWidgetConfig = {
	id: string;
	name: string;
	appConfigs: AppWidgetConfig[];
};
