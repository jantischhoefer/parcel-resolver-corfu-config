# parcel-resolver-corfu-config

Parcel resolver for integrating Corfu configuration into Telestion frontend

It relies on the Parcel plugin system and is using the Resolver functionality to
create a virtual module that can be imported into a Telestion Client project.
[Parcel Resolver](https://parceljs.org/plugin-system/resolver/).

## Preparation

The following tools are needed to build the parcel-resolver-corfu-config:

- [NodeJS](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/installation)

## Setup

Make sure you have [Verdaccio](https://verdaccio.org/) installed and running:

```
pnpm install -g verdaccio
verdaccio
```

Next, set up pnpm to use the current Verdaccio instance as the main npm registry:

```
pnpm set registry http://localhost:4873/
pnpm adduser --registry http://localhost:4873/
```

Now you can clone this repository, build it and publish it to your local registry:

```
git clone git@github.com:jantischhoefer/parcel-resolver-corfu-config.git
cd parcel-resolver-corfu-config
```

Make sure that in `src/resolver.ts` your `pathToConfig` is pointing to the directory where
your configuration files are located.
By default, it searches for the `on-board-software-master` directory outside this project.
If you're configuration directory is located somewhere else and is named differently
you have to change the `path.resolve(...)` command to point to your directory.
Here you can take a look at how [path.resolve()](https://nodejs.org/api/path.html#pathresolvepaths) works.
Now that this is set up, you can build the project and publish it to your local registry:

```
pnpm build
pnpm publish --no-git-checks
```

Now go into your Telestion Client project //TODO: link and add this package to your devDependencies:

```
pnpm add -D parcel-resolver-corfu-config
```

This will add the version you published to your local repository.
In your Telestion Client project go to the `.parcelrc` file and replace the `"resolvers"` with:

```
"resolvers": ["parcel-resolver-corfu-config", "@wuespace/parcel-resolver-react", "..."]
```

In your user configuration `src/model/sample-user-config.ts` you can now import `corfuDashboards` from the specified path of your resolver.
Your user configuration file in the Telestion Client should look like this now:

```
import { UserConfig } from '@wuespace/telestion-client-types';
import { corfuDashboards } from 'corfu-config';

export const userConfig: UserConfig = {
	admin: {
		dashboards: [
			...corfuDashboards
		]
	}
};
```

Now run your Telestion Client application and see the automatically generated widgets in action.
