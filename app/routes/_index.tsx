import { data, MetaFunction } from "@remix-run/react";
import { LoaderFunction, useLoaderData } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};



export const loader: LoaderFunction =()=>{
  return data(
    { message: "JS es caca"},
    {
      status: 418,
      headers: {
        custom: "Java wannabe",
      },
    }
  );
}

export default function Index() {
  const data= useLoaderData();
  return (
    <>
      <h1>Remix recipes</h1>
      <p>Hey! Listen to this: {data.message} </p>
    </>
  );
}
