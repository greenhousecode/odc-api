# odc-api

An API that simplifies working with the WPP ODC platform. It's still a W.I.P., so not all functionality from the ODC platform is included. Note that this library is not officially supported by the ODC development team. Before using this in a case, discuss what you're up to with the development team so you know for sure the platform will be able to handle it. This library is using the Front End API, so it might not be suitable for large quantities of data.

In case you're missing some functionality, contact MEH@greenhousegroup.com for more information.

## Example 1: Create Context Rule

```js
import ODCAuthClient, { Adset, predicateHelper } from "../src/index";

(async () => {
  try {
    const authClient = new ODCAuthClient({
      email: process.env.EMAIL,
      password: process.env.PASSWORD,
    });
    const adset = new Adset(authClient, 1234);
    await adset.syncContent("draft");

    adset.addContextRule({
      predicate: predicateHelper.create("id", "=", "1234"),
      assignments: [{ name: "title", expr: "A new Title for this ID" }],
    });

    await adset.saveChanges();
  } catch (e) {
    console.log(e);
  }
})();
```

# Structure

## Classes

### ODC

Client class that handles authentication and requests.

Usage:

```js
const authClient = new ODCAuthClient({
  email: EMAIL<String>,
  password: PASSWORD<String>,
});
```

Exposes three different methods:

- GET
- POST
- UPDATE

#### Switch to another agency

When your account has access to multiple agencies, you should explicitely switch to that agency.

Usage:

```js
authclient.switchAgency(1);
```

Please note that it's a best practise to create a dedicated account for API usage.

## Entitites

### Adset

Class for updating an Adset. Not yet supporting the creation of adsets dynamically.

Usage:

```js
new Adset(odcClient <ODCAuthClient>, adsetId <Number>);
```

### AdsetService

Service that wraps multiple functions of the Adset entity, making it easier to use. For example, when creating a Context Rule, you don't have to manually sync the adset content and save the changes afterwards.

Usage:

```js
const adsetService = new AdsetService(odcClient <ODCAuthClient>);
await adsetService.addContextRules(adsetId: <Number>, rules: <ContextRule[]>);
```
