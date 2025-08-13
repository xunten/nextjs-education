import { authService } from "@/services/authService";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
  role?: "teacher" | "student";
  roles?: Array<"teacher" | "student">;
}

export const authOptions: NextAuthOptions = {
  debug: true,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const data = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          // Kiểm tra dữ liệu trả về
          if (!data || (data as any).error) {
            console.error("Login API error:", data);
            return null;
          }

          // Tạo user object để NextAuth lưu vào token và session
          const user: AppUser = {
            id: data.userId.toString(),
            name: data.username,
            email: data.email,
            avatar: "",
            accessToken: data.accessToken,
            refreshToken: "",
            role:
              data.roles.length === 1
                ? (data.roles[0] as "teacher" | "student")
                : undefined,
            roles: data.roles as Array<"teacher" | "student">,
          };

          return user;
        } catch (error) {
          console.error("Login error", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Lần đầu đăng nhập (có user + account)
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.roles = user.roles;

        // Nếu đăng nhập bằng Google, lấy token OAuth gốc
        if (account.provider === "google") {
          token.accessToken = account.access_token ?? token.accessToken;
          token.refreshToken = account.refresh_token ?? token.refreshToken;
          token.idToken = account.id_token ?? token.idToken;
          token.role = user.role;
          token.roles = user.roles;

          try {
            const credential = account.id_token || account.access_token;

            const data = await authService.googleLoginWithCredential(
              credential
            );

            if (data) {
              token.id = data.userId?.toString() || token.id;
              token.name =
                data.fullName || token.name || data.username || data.email;
              token.email = data.email || token.email;
              token.avatar = data.avatar || token.avatar || "";
              token.accessToken = data.accessToken || token.accessToken;
              token.refreshToken = data.refreshToken || token.refreshToken;
            } else {
              console.error("Google login backend error:", data);
            }
          } catch (error) {
            console.error("Error calling backend Google login API:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        if (token.role) {
          session.user.role = token.role as "teacher" | "student";
        }
        if (token.roles) {
          session.user.roles = token.roles as Array<"teacher" | "student">;
        }
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Mở rộng kiểu dữ liệu NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    accessToken: string;
    refreshToken: string;
    role?: "teacher" | "student";
    roles?: Array<"teacher" | "student">;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar: string;
    accessToken: string;
    refreshToken: string;
    role?: "teacher" | "student";
    roles?: Array<"teacher" | "student">;
  }
}
