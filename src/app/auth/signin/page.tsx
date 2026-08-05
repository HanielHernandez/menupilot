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
import Link from "next/link";
import { useRouter } from "next/navigation";
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
        // Don't leak whether the email exists — keep it generic
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthLogo />
      <Card className="w-full md:max-w-md">
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
                      className="text-muted-foreground text-sm hover:text-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input type="password" required id="password" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {serverError && <p className="text-red-500">{serverError}</p>}

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
          <p className="text-sm text-muted-foreground text-center">
            Dont have an account? click here to{" "}
            <Link href="/auth/signup" className="font-bold text-blue-500">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
