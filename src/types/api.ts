/**
 * API Response Types
 * 
 * This file contains TypeScript types for API responses used throughout the application.
 */

/**
 * Current Admin User API Response
 * 
 * Endpoint: GET /api/cp/admins/current
 * 
 * Response format:
 * {
 *   "admin": {
 *     "id": 14,
 *     "name": "Muhammad Sannan Yousaf",
 *     "name_l1": null,
 *     "email": "sannan.yousaf@dubizzlelabs.com",
 *     "mobile": null,
 *     "whatsapp": null,
 *     "is_active": true,
 *     "permission_map": {
 *       "all": true
 *     },
 *     "profile_image": null,
 *     "roles": [
 *       {
 *         "id": 1,
 *         "reference_number": 1,
 *         "name": "Super Admin",
 *         "name_l1": null,
 *         "slug": "super-admin",
 *         "description": "super admin role, can access all the modules",
 *         "description_l1": null
 *       },
 *       {
 *         "id": 23,
 *         "reference_number": 23,
 *         "name": "Store Manager",
 *         "name_l1": null,
 *         "slug": "store-manager",
 *         "description": "dashboard,manage orders",
 *         "description_l1": null
 *       }
 *     ]
 *   },
 *   "success": true
 * }
 */
export interface AdminRole {
  id: number;
  reference_number: number;
  name: string;
  name_l1: string | null;
  slug: string;
  description: string;
  description_l1: string | null;
}

export interface Admin {
  id: number;
  name: string;
  name_l1: string | null;
  email: string;
  mobile: string | null;
  whatsapp: string | null;
  is_active: boolean;
  permission_map: {
    all: boolean;
    [key: string]: boolean;
  };
  profile_image: string | null;
  roles: AdminRole[];
}

export interface CurrentAdminResponse {
  admin: Admin;
  success: boolean;
}

