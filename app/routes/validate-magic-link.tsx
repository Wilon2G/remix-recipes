import { data, LoaderFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import classNames from "classnames";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { getMagicLinkPayload } from "~/magic-links.server";
import { getUser } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";

const magicLinkMaxAge = 1000 * 60 * 10; //10 min

export const loader: LoaderFunction = async ({ request }) => {
  const magicLinkPayload = getMagicLinkPayload(request);
  console.log(magicLinkPayload);

  const createdAt = new Date(magicLinkPayload.createdAt);
  const expiresAt = createdAt.getTime() + magicLinkMaxAge;
  if (Date.now() > expiresAt) {
    throw data({ message: "The magic link has expired" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  if (session.get("nonce") !== magicLinkPayload.nonce) {
    throw data({ message: "Invalid nonce" }, { status: 400 });
  }

  const user = await getUser(magicLinkPayload.email);
  if (user) {
    session.set("userId", user.id);
    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return data("ok", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function validateMagicLink() {
  return (
    <div className="text-center">
      <div className="mt-24">
        <h1 className="text-2xl">You&apos;re almost done!</h1>
        <h2>Type in your name below to complete the signup process:</h2>
        <form
          method="POST"
          className={classNames(
            "flex flex-col px-8 mx-16 md:mx-auto",
            "border-2 border-gray-200 rounded-md p-8 mt-8 md:w-80"
          )}
        >
          <fieldset className="mb-8 flex flex-col">
            <div className="text-left mb-4">
              <label htmlFor="firstName">First Name:</label>
              <PrimaryInput
                id="firstName"
                autoComplete="off"
                name="firstName"
              />
              <ErrorMessage></ErrorMessage>
            </div>
            <div className="text-left ">
              <label htmlFor="lastName">Last Name:</label>
              <PrimaryInput
                id="lastName"
                autoComplete="off"
                name="lastName"
              />
              <ErrorMessage></ErrorMessage>
            </div>
          </fieldset>
          <PrimaryButton className="w-36 mx-auto">Sign Up</PrimaryButton>
        </form>
      </div>
    </div>
  );
}

//083