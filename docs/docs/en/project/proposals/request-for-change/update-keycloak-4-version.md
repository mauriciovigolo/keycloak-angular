# Proposal: Update to Keycloak 4 Version

Version 4.0.0-beta2 of [Keycloak was released](https://blog.keycloak.org/2018/05/keycloak-400beta2-released.html) and keycloak-angular must be compatible to the new version, keeping compatibility with the previous version (3).

---

## <a name="toc"></a> Table of Contents

* [Proposed By](#prb)
* [History](#his)
* [Reason to add](#rta)
* [Implementation Details](#imd)

---

## <a name="prb"></a> Proposed By

* Name: Mauricio Gemelli Vigolo
* Date: 2018-05-08
* Github user: [mauriciovigolo](https://github.com/mauriciovigolo)

### <a name="his"></a> History

|    Date    |                        User                         | Details                          |
| :--------: | :-------------------------------------------------: | -------------------------------- |
| 2018-05-08 | [mauriciovigolo](https://github.com/mauriciovigolo) | Initial version of this document |

## <a name="rta"></a> Reason to add

Besides in beta, there are people already using the new version of Keycloak, so to avoid breaking and errors during runtime, keycloak-angular also needs to release a compatible version with keycloak 4.

The issue here is: as [keycloak-js](https://github.com/keycloak/keycloak-js-bower) is a dependency to keycloak-angular, the library needs to have different builds for keycloak versions 3, 4 and further versions.
One more aspect to consider is that keycloak-angular major version is following the angular major version we can't follow the keycloak major versions.

## <a name="imd"></a> Implementation Details

To solve possible breaking changes in major releases of [keycloak-js](https://www.npmjs.com/package/keycloak-js), the keycloak-angular must keep the keycloak-js as a dependency, since the possibility to change it to a peer-dependency could result in unpredictable errors, as the developer would have to install it manually. This subject was discussed on [issue #19](https://github.com/mauriciovigolo/keycloak-angular/issues/19).

Considering the situation described on [Reason to add](#rta) topic and on the paragraph above, the project since the next releases: 4.x.x, 5.x.x and 6.x.x, will follow this versioning mechanism:

| keycloak-angular | Angular |           Keycloak            | SSO-RH |
| :--------------: | :-----: | :---------------------------: | :----: |
|      4.x.x       |    4    | (keycloak latest version) / 4 |   -    |
|     4.x.x-k3     |    4    |               3               |   7    |
|      5.x.x       |    5    | (keycloak latest version) / 4 |   -    |
|     5.x.x-k3     |    5    |               3               |   7    |
|      6.x.x       |    6    | (keycloak latest version) / 4 |   -    |
|     6.x.x-k3     |    6    |               3               |   7    |

### Summary

* keycloak-angular X.X.X: will be compatible with the **latested version of keycloak**, at the moment of this writing is **keycloak 4** or the **future release of SSO-RH based on keycloak 4**.
* keycloak-angular X.X.X-k3: will be compatible with **keycloak 3** and **SSO-RH 7**.
