import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { Dashboard, WidgetDefinition } from '@wuespace/telestion-client-types';
import * as p from 'path';
import { Resolver } from '@parcel/types';
import {
	AppConfig,
	AppWidgetConfig,
	NodeConfig,
	NodeWidgetConfig,
	TelecommandWidgetConfig
} from './model';

// Type of the input file system of Parcel
type PluginOptions = Parameters<Resolver["resolve"]>[0]["options"];

/**
 * Function that reads a Corfu Node configuration file
 *
 * @param filename - path string to the Node config.yaml file
 * @param inputFS - the parcel resolver filesystem API
 */
async function getNodeConfig(filename: string, inputFS: PluginOptions["inputFS"]): Promise<NodeConfig | undefined> {
	try {
		const doc = yaml.load(inputFS.readFileSync(filename, 'utf-8'));
		const nc = {} as NodeConfig;
		nc.apps = [];
		// eslint-disable-next-line no-restricted-syntax
		for (const [key, values] of Object.entries(doc as object)) {
			if (key === 'id') nc.id = `0x${values.toString(16).toUpperCase()}`;
			if (key === 'name') nc.name = values;
			if (key === 'apps') {
				if (values) {
					// eslint-disable-next-line no-restricted-syntax
					for (const [akey] of Object.entries(values)) {
						nc.apps.push(akey);
					}
				}
			}
		}
		return nc;
	} catch (e) {
		console.error(e.toString());
		return undefined;
	}
}

/**
 * Function that reads all Node configurations in a directory
 *
 * @param path - path string to the directory containing the Node configurations
 * @param inputFS - the parcel resolver filesystem API
 */
async function getAllNodeConfigs(path: string, inputFS: PluginOptions["inputFS"]): Promise<NodeConfig[]> {
	const cfgs = [] as NodeConfig[];
	try {
		const dir = inputFS.readdirSync(path);
		// eslint-disable-next-line no-restricted-syntax
		for (const f of dir) {
			if (fs.statSync(`${path}/${f}`).isFile()) {
				if (f.endsWith('.yml') || f.endsWith('.yaml')) {
					const nc = await getNodeConfig(`${path}/${f}`, inputFS);
					if (nc) cfgs.push(nc);
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
	return cfgs;
}

/**
 * Function that parses all Corfu Node configuration files in a directory
 *
 * @param path - path string to all Node configurations
 * @param appWidgets - all the available appWidgets
 * @param inputFS - the parcel resolver filesystem API
 */
async function getAllNodeWidgetConfigs(
	path: string,
	appWidgets: AppWidgetConfig[],
	inputFS: PluginOptions["inputFS"]
): Promise<NodeWidgetConfig[]> {
	const cfgs = await getAllNodeConfigs(path, inputFS);
	const widgetCfgs = [] as NodeWidgetConfig[];
	// eslint-disable-next-line no-restricted-syntax
	for (const cfg of cfgs) {
		const appWidgetCfgs = [] as AppWidgetConfig[];
		// eslint-disable-next-line no-restricted-syntax
		for (const a of cfg.apps) {
			const awid = appWidgets.filter(aw => aw.name === a);
			if (awid.length > 0) appWidgetCfgs.push(awid[0]);
		}
		widgetCfgs.push({ id: cfg.id, name: cfg.name, appConfigs: appWidgetCfgs });
	}
	return widgetCfgs;
}

/**
 * Function that reads the Corfu App configuration file
 *
 * @param filename - path string to the App config.yaml file
 * @param inputFS - the parcel resolver filesystem API
 */
async function getAppConfig(filename: string, inputFS: PluginOptions["inputFS"]): Promise<AppConfig | undefined> {
	try {
		const doc = yaml.load(inputFS.readFileSync(filename, 'utf8'));
		const ac = {} as AppConfig;
		// eslint-disable-next-line no-restricted-syntax
		for (const [key, values] of Object.entries(doc as object)) {
			// keep the hex string as id
			if (key === 'id') ac.id = `0x${values.toString(16).toUpperCase()}`;
			if (key === 'name') ac.name = values;
			if (key === 'telecommands') ac.telecommands = values;
		}
		if (!ac.name) {
			const s = filename.split('/');
			ac.name = s[s.length - 2];
		}
		return ac;
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

/**
 * Function that reads all Corfu App configuration files in a directory
 *
 * @param path - path string to the App config.yaml files
 * @param inputFS - the parcel resolver filesystem API
 */
async function getAllAppConfigs(path: string, inputFS: PluginOptions["inputFS"]): Promise<AppConfig[]> {
	const cfgs = [] as AppConfig[];
	try {
		const dir = inputFS.readdirSync(path);
		// eslint-disable-next-line no-restricted-syntax
		for (const d of dir) {
			if (inputFS.statSync(`${path}/${d}`).isDirectory()) {
				const files = fs.readdirSync(`${path}/${d}`);
				// eslint-disable-next-line no-restricted-syntax
				for (const file of files) {
					if (file.endsWith('.yml') || file.endsWith('.yaml')) {
						const tcCfg = await getAppConfig(`${path}/${d}/${file}`, inputFS);
						if (tcCfg) cfgs.push(tcCfg);
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
	return cfgs;
}

/**
 * Function that parses the Corfu App configuration file
 *
 * @param appConfig - configuration file that has been read with {@link getAppConfig}
 */
async function getAppWidgetConfig(appConfig: AppConfig): Promise<AppWidgetConfig> {
	const aw = {} as AppWidgetConfig;
	aw.id = appConfig.id;
	aw.name = appConfig.name;
	aw.telecommands = [];
	// eslint-disable-next-line no-restricted-syntax
	for (const [key, values] of Object.entries(appConfig.telecommands)) {
		const tc = {} as TelecommandWidgetConfig;
		tc.name = key;
		// eslint-disable-next-line no-restricted-syntax
		for (let [vkey, vvalues] of Object.entries(values)) {
			if (vkey === "id") {
				if (typeof vvalues === "number") tc.id = vvalues;
				continue;
			}
			if (vkey === "fields") {
				if (vvalues !== null) {
					tc.fields = [];
					for (let [vvkey, vvvalues] of Object.entries(vvalues)) {
						tc.fields.push({ name: vvkey, type: vvvalues });
					}
				}
				continue;
			}
			if (vkey === "array") {
				if (vvalues !== null) {
					tc.array = vvalues as ArrayField;
				}
				continue;
			}
		}
		aw.telecommands.push(tc);
	}
	return aw;
}

/**
 * Function that parses all Corfu App configuration files in a directory
 *
 * @param path - path string to the directory containing all app config.yaml files
 * @param inputFS - the parcel resolver filesystem API
 */
async function getAllAppWidgetConfigs(path: string, inputFS: PluginOptions["inputFS"]): Promise<AppWidgetConfig[]> {
	const cfgs = await getAllAppConfigs(path, inputFS);
	const appWidgets = [] as AppWidgetConfig[];
	// eslint-disable-next-line no-restricted-syntax
	for (const cfg of cfgs) {
		appWidgets.push(await getAppWidgetConfig(cfg));
	}
	return appWidgets;
}

/**
 * Helper function that returns double the widget height if the telecommand
 * has more than two fields.
 *
 * @param telecommands - include all fields to calculate a larger widget height
 */
function getWidgetHeight(telecommands: TelecommandWidgetConfig[]): number {
	const maxFields = Math.max(
		...telecommands.map(tc => (tc.fields ? tc.fields.length : 0))
	);
	return maxFields > 2 ? 2 : 1;
}

/**
 * Helper function to change the first character of a string to uppercase.
 *
 * @param str - string to capitalize
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const APPS_DIR = 'apps';
export const NODES_DIR = 'nodes';

/**
 * Function that parses all configuration files found at a given path and
 * turns them into a Dashboard.
 *
 * @param path - path string to the configuration folder
 * @param inputFS - the parcel resolver file system API
 */
export async function parse(path: string, inputFS: PluginOptions["inputFS"]): Promise<Dashboard[]> {
	const appDir = p.join(path, APPS_DIR);
	const nodeDir = p.join(path, NODES_DIR);

	const appWidgets = await getAllAppWidgetConfigs(appDir, inputFS);
	const nodeWidgets = await getAllNodeWidgetConfigs(nodeDir, appWidgets, inputFS);

	const dashboards: Dashboard[] = [];

	nodeWidgets.forEach(nw => {
		const dashboard: Dashboard = {
			title: capitalize(nw.name),
			columns: 2,
			rows: Math.ceil(nw.appConfigs.length / 2) || 1,
			widgets: []
		};
		nw.appConfigs.forEach(ac => {
			const widget: WidgetDefinition = {
				id: `corfu-config-${nw.id}-${ac.id}`,
				widgetName: 'appWidget',
				width: 1,
				height: getWidgetHeight(ac.telecommands),
				initialProps: {
					nodeId: nw.id,
					appId: ac.id,
					appName: ac.name,
					telecommands: ac.telecommands
				}
			};
			dashboard.widgets.push(widget);
		});
		dashboards.push(dashboard);
	});

	return dashboards;
}

/**
 * Function that generates the exported dashboard object code
 * which will be used by the resolver.
 *
 * @param dashboards - the generated dashboard configuration object
 */
export function generate(dashboards: Dashboard[]): string {
	return `export const corfuDashboards = ${JSON.stringify(
		dashboards,
		null,
		2
	)};`;
}
