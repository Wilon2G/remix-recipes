import { data, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useRouteError } from "react-router";

export const loader: LoaderFunction = () => {
  return data(
    { message: "JS es caca" },
    {
      status: 400,
      headers: {
        custom: "Java wannabe",
      },
    }
  );
};

export default function Discover() {
  const data = useLoaderData();
  return (
    <div>
      <h1>Discover</h1>
      <p>This is discover</p>
      <p>{data?.values.message}</p>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
        <div className="bg-red-300 border-2 border-red-600 rounded-md p-4">
          <h1>Something went wrong!</h1>
          <p>{error.message}</p>
        </div>
      );
  }
  return(
    <div>
        <h1>Something went wrong</h1>
    </div>
  )
  
}
