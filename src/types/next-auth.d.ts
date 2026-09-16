import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    locale?: string;
    theme?: string;
    changeColorScheme?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      locale?: string;
      theme?: string;
      changeColorScheme?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    locale?: string;
    theme?: string;
    changeColorScheme?: string;
  }
}
