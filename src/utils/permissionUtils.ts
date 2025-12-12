
import { GetMyRolesResponse } from "../interfaces/auth/myRoles.interface";
import { UserEnterpriseResponse } from "../interfaces/auth";

export const hasPermission = (resource: string, actions: string[]): boolean => {
    // 1. Check if Owner
    try {
        const userRelationEnterpriseStr = localStorage.getItem('userRelationEnterprise');
        if (userRelationEnterpriseStr) {
            const userRelationEnterprise = JSON.parse(userRelationEnterpriseStr) as UserEnterpriseResponse;
            if (userRelationEnterprise.enterprises?.length > 0 && userRelationEnterprise.enterprises[0].isOwner) {
                return true;
            }
        }
    } catch (error) {
        console.error("Error checking owner permission:", error);
    }

    // 2. Check Roles
    try {
        const myRolesStr = localStorage.getItem('myRoles');
        if (!myRolesStr) return false;

        const myRoles = JSON.parse(myRolesStr) as GetMyRolesResponse;
        
        // Safety check if roles exist
        if (!myRoles.roles || myRoles.roles.length === 0) return false;

        // Iterate over user's roles
        for (const role of myRoles.roles) {
            if (!role.permissions) continue;

            // Iterate over permissions in each role
            for (const permission of role.permissions) {
                // Check if resource matches
                if (permission.resource === resource) {
                    // Check if action matches one of the allowed actions
                    if (actions.includes(permission.action)) {
                        return true;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error checking role permissions:", error);
        return false;
    }

    return false;
};
