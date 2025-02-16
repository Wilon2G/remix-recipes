import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { data, Form, useActionData } from "@remix-run/react";
import classNames from "classnames";
import { z } from "zod";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { generateMagicLink } from "~/magic-links.server";
import {  commitSession, getSession } from "~/sessions";
import { validateForm } from "~/utils/validation";
import {v4 as uuid }from "uuid";

const loginSchema = z.object({
  email: z.string().email(),
});

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  console.log("Session data: ", session.data);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  return validateForm(
    formData,
    loginSchema,
    async ({ email }) => {
      const nonce= uuid();
      session.flash("nonce",nonce);
      const link=generateMagicLink(email,nonce);
      console.log(link);
      return data("ok",{
        headers:{
          "Set-Cookie":await commitSession(session)
        }
      });
    },
    (errors) => data({ errors, email: formData.get("email") }, { status: 400 })
  );
};

export default function Login() {
  const action = useActionData();
  return (
    <div className="text-center mt-36 ">
      <h1 className="text-3xl mb-8">Remix Recipes</h1>
      <Form method="POST" className="mx-auto md:w-1/3">
        <div className="text-left pb-4">
          <PrimaryInput
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="off"
          />
          <ErrorMessage>{action?.errors?.email}</ErrorMessage>
        </div>
        <PrimaryButton className="w-1/3 mx-auto">Log In</PrimaryButton>
      </Form>
    </div>
  );
}
