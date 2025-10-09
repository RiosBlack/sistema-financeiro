import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role?: {
      id: string;
      name: string;
      description: string;
    };
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: {
        id: string;
        name: string;
        description: string;
      };
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sub?: string;
    role?: {
      id: string;
      name: string;
      description: string;
    };
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}
