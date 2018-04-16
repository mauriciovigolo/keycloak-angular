# Proposal: impersonate-api

IHAC that needed a NPM module to integrate with angular apps. So I've started designing my own keycloak module last year and we had some improvements in terms of using the impersonate-user API.

With this feature, we can be able to create a feature that can be used to simulate other keycloak users.
There is an excellent article about this feature: https://blog.softwaremill.com/who-am-i-keycloak-impersonation-api-bfe7acaf051a

I had designed a feature based on the following method signature:

```typescript
Promise<boolean> KeycloakService.impersonate('7901ed55-af33-47f1-24a9-e197ra667afc')
```

## Proposed By

* Name: raphael abreu
* Date: 27-03-2018
* Github user: [@aelkz](https://github.com/aelkz)

## Reason to add

It will be awesome to bring such feature so the admin users (from the application) can impersonate other users, to help with technical support and analyze the application with the end user perspective.<br>This could also bring an extension for security tests and profile validation (keycloak groups and roles). 

## Implementation Details

Further details of such feature were provided through the guidelines of the awesome article above.<br>There are many ways to implement this feature because of different <b>Keycloak</b> versions.
We can provide the latest approach for newest versions for the first release.

The following method signatures could be available for use within this API:

```typescript
private isImpersonated(): boolean
public impersonate(userId: string): Promise<boolean>
private setImpersonator(i: UserRepresentation | null)
private getImpersonator(): UserRepresentation
```
Tip: We can think of a specific service for this functionality.<br>We can keep the ```keycloak.service.ts``` class as a core class and keep it isolated from extra services implementations.