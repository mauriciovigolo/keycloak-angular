# Keycloak-Angular Directives

Keycloak-Angular provides directives to manage role-based rendering and access control in Angular templates. These directives are designed to simplify the process of showing or hiding parts of the UI based on the authenticated user's roles and access permissions.

---

## **1. `*kaHasRoles` Directive**

### Purpose

The `*kaHasRoles` directive is a structural directive that conditionally renders DOM elements based on the authenticated user's roles. It supports validation against both realm roles and resource roles.

### Key Features

- **Role-Based Rendering**: Displays or hides DOM elements based on user roles.
- **Resource Role Validation**: Supports client-specific resource roles.
- **Realm Role Validation**: Allows checking roles assigned at the realm level.
- **Fallback Content**: Supports fallback templates when the user lacks required roles.

---

### Inputs

| Input                  | Type       | Description                                                                  |
| ---------------------- | ---------- | ---------------------------------------------------------------------------- |
| `kaHasRoles`           | `string[]` | Array of roles to validate against.                                          |
| `kaHasRolesResource`   | `string`   | (Optional) The resource (client ID) to validate roles against.               |
| `kaHasRolesCheckRealm` | `boolean`  | (Optional) Whether to validate roles at the realm level. Default is `false`. |

---

### Requirements

1. A Keycloak instance must be properly configured and injected via Angular's dependency injection.
2. The user must be authenticated in Keycloak for role checks to work.

---

### Examples

#### Example 1: Checking Realm Roles

Display content only if the user has the `admin` or `editor` role at the realm level.

```html
<div *kaHasRoles="['admin', 'editor']; kaHasRolesCheckRealm: true">
  <p>This content is visible to users with 'admin' or 'editor' realm roles.</p>
</div>
```

#### Example 2: Checking Resource Roles

Display content only if the user has the `read` or `write` role for the `my-client` resource.

```html
<div *kaHasRoles="['read', 'write']; kaHasRolesResource: 'my-client'">
  <p>This content is visible to users with 'read' or 'write' roles for 'my-client'.</p>
</div>
```

#### Example 3: Fallback Content

Provide fallback content for users without the required roles.

```html
<div *kaHasRoles="['admin']; kaHasRolesResource: 'my-client'">
  <p>Welcome, Admin!</p>
</div>
<ng-template #noAccess>
  <p>Access Denied</p>
</ng-template>
```

#### Example 4: Combining Realm and Resource Role Checks

Display content if the user has the roles in either the realm or a specific resource.

```typescript
<div *kaHasRoles="['admin', 'write']; kaHasRolesResource: 'my-client'; kaHasRolesCheckRealm: true">
  <p>This content is visible to users with 'admin' in the realm or 'write' in 'my-client'.</p>
</div>
```

#### Implementation Details

The directive uses Keycloak's role-checking APIs (`hasRealmRole` and `hasResourceRole`) to validate roles. If the user matches any of the specified roles, the content is rendered; otherwise, it is removed from the DOM.

### Usage Notes

- If no resource is specified using `kaHasRolesResource`, the directive defaults to the Keycloak application client ID.
- Combine realm and resource checks for advanced role-based access scenarios.
- Ensure the roles specified in the directive exist in your Keycloak server configuration.
