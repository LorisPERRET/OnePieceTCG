import { redirect } from "next/navigation";
import { auth } from "@/lib/services/auth";
import { SignInButton } from "@/app/auth/signin/sign-in-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

const toCallbackUrl = (value: string | undefined): string => {
  if (!value) {
    return "/cards";
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/cards";
  } catch {
    return "/cards";
  }
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/cards");
  }

  const callbackUrl = toCallbackUrl((await searchParams).callbackUrl);
  const hasError = Boolean((await searchParams).error);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto text-6xl">🏴‍☠️</div>
          <CardTitle className="text-3xl">One Piece Card Manager</CardTitle>
          <CardDescription className="text-base">
            Pour accéder à l'application, connectez-vous avec votre compte Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasError ? (
            <p className="auth-error">La connexion Google a echoue. Reessaie.</p>
          ) : null}
          <SignInButton callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
