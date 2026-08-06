"use client";

import { AuthLogo } from "@/components/auth-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobeIcon, ImagesIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: "Email must be at least 6 characters" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormType = z.infer<typeof formSchema>;

const highlights = [
  {
    icon: ImagesIcon,
    title: "Upload your menu",
    description: "Add one or more clear images of your printed menu.",
  },
  {
    icon: SparklesIcon,
    title: "AI-powered menu creation",
    description:
      "MenuPilot reads your dishes, descriptions, categories, and prices automatically.",
  },
  {
    icon: GlobeIcon,
    title: "Get a shareable website",
    description:
      "Receive a customized menu page with its own URL, ready to share with your customers.",
  },
] as const;

export default function SignInPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FormType) => {
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(
          error.status === 401 || error.status === 403
            ? "Invalid email or password"
            : (error.message ?? "Something went wrong. Try again."),
        );
        return;
      }

      router.replace("/dashboard");
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
      );
      console.error(error);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.83 0.1 65), transparent), radial-gradient(ellipse 70% 50% at 80% 80%, oklch(0.58 0.12 155 / 0.45), transparent)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-xl flex-col gap-10 px-10 py-16 xl:px-16">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="MenuPilot"
              width={64}
              height={64}
              className="rounded-xl"
              priority
            />
            <span className="text-xl font-semibold tracking-tight">
              MenuPilot
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance xl:text-5xl">
              Turn your menu into a website with AI
            </h1>
            <p className="text-base/relaxed text-primary-foreground/85 text-pretty xl:text-lg">
              Upload photos of your restaurant menu and let MenuPilot
              automatically create a clean, professional online menu.
            </p>
          </div>

          <ul className="flex flex-col gap-6">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="bg-primary-foreground/15 flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <item.icon className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold tracking-tight">{item.title}</p>
                  <p className="text-sm/relaxed text-primary-foreground/80">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="relative flex flex-col items-center justify-center overflow-hidden p-6 sm:p-10">
        <Image
          src="/auth-form-bg.png"
          alt=""
          fill
          priority
          quality={95}
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          <AuthLogo />
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit(onSubmit)(event);
                }}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input type="email" required id="email" {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel>Password</FieldLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        type="password"
                        required
                        id="password"
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {serverError ? (
                  <p className="text-sm text-red-500">{serverError}</p>
                ) : null}

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmit(onSubmit)()}
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-center text-sm">
                Dont have an account? click here to{" "}
                <Link href="/auth/signup" className="font-bold text-blue-500">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
