"use client";

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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormType = z.infer<typeof formSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const [serverError, setServerError] = useState<string | null>(
    errorParam === "INVALID_TOKEN" ? "This reset link is invalid or expired." : null,
  );

  const onSubmit = async (data: FormType) => {
    if (!token) {
      setServerError("Missing reset token. Request a new password reset link.");
      return;
    }

    setServerError(null);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        setServerError(error.message ?? "Could not reset password. Try again.");
        return;
      }

      router.replace("/auth/signin");
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <Card className="w-full md:max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!token && !errorParam ? (
          <p className="text-muted-foreground text-sm">
            This page needs a valid reset token.{" "}
            <Link
              href="/auth/forgot-password"
              className="font-bold text-blue-500"
            >
              Request a new link
            </Link>
            .
          </p>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit(onSubmit)(event);
            }}
          >
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>New password</FieldLabel>
                  <Input type="password" required id="password" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Confirm password</FieldLabel>
                  <Input
                    type="password"
                    required
                    id="confirmPassword"
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
              disabled={isSubmitting || !token}
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {isSubmitting ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-center text-sm">
          <Link href="/auth/signin" className="font-bold text-blue-500">
            Back to Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full md:max-w-md">
            <CardHeader>
              <CardTitle>Reset password</CardTitle>
              <CardDescription>Loading…</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
