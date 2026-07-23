"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function singInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full md:max-w-lg">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input name="email" type="email" required id="email" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input name="password" type="password" required id="password" />
            </Field>

            <Button type="submit">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
