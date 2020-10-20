# odc-api

API that simplifies working with the WPP ODC platform

## Structure

### ODC

Base class that handles authentication and requests. Exposes three different methods:

- GET
- POST
- UPDATE

```
ODC
  - Campaign
    - Adset
  - Asset
  - Dynamic Input
  - Product
```
