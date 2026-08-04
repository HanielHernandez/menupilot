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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: "Email must be at least 6 characters" })
    .email({ message: "Invalid email address" }),
});

type FormType = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormType) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setServerError(
          error.message ?? "Something went wrong. Try again.",
        );
        return;
      }

      setSuccessMessage(
        "If this email exists in our system, check your inbox for a reset link.",
      );
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full md:max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your
            password.
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

            {serverError ? (
              <p className="text-sm text-red-500">{serverError}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-700">{successMessage}</p>
            ) : null}

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {isSubmitting ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-center text-sm">
            Remember your password?{" "}
            <Link href="/auth/signin" className="font-bold text-blue-500">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
