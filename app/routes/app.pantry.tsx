import { ActionFunction, data, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import classNames from "classnames";
import { z } from "zod";
import { DeleteButton, ErrorMessage, PrimaryButton } from "~/components/form";
import { PlusIcon, SaveIcon, SearchIcon, TrashIcon } from "~/components/icons";
import { createShelfItem, deleteShelfItem } from "~/models/pantry-item.server";
import {
  createShelf,
  deleteShelf,
  getAllShelves,
  saveShelfName,
} from "~/models/pantry-shelf.server";
import { validateForm } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const shelves = await getAllShelves(q);
  return data({ shelves });
}

//==========ESQUEMA DE ZOD PARA VALIDAR LA ELIMINACIÓN DE SHELF=======
const deleteShelfSchema = z.object({
  shelfId: z.string(),
});

//==========ESQUEMA DE ZOD PARA VALIDAR EL CAMBIO DE NOMBRE DE SHELF=======
const saveShelfNameSchema = z.object({
  shelfName: z.string().min(1, "Shelf name cannot be blank"),
  shelfId: z.string(),
});

//==========ESQUEMA DE ZOD PARA VALIDAR LA CREACIÓN DE UN ITEM EN UNA SHELF=======
const createShelfItemSchema = z.object({
  itemName: z.string().min(1, "Item name cannot be blank"),
  shelfId: z.string(),
});

//==========ESQUEMA DE ZOD PARA ELIMINAR UN ITEM DE SHELF=======
const deleteShelfItemSchema = z.object({
  itemId: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "createShelf": {
      return createShelf();
    }
    case "deleteShelf": {
      return validateForm(
        formData,
        deleteShelfSchema,
        (data) => deleteShelf(data.shelfId),
        (errors) => data({ errors }, { status: 400 })
      );
    }
    case "saveShelfName": {
      return validateForm(
        formData,
        saveShelfNameSchema,
        (data) => saveShelfName(data.shelfId, data.shelfName),
        (errors) => data({ errors }, { status: 400 })
      );
    }
    case "createShelfItem": {
      return validateForm(
        formData,
        createShelfItemSchema,
        (data) => createShelfItem(data.shelfId, data.itemName),
        (errors) => data({ errors }, { status: 400 })
      );
    }
    case "deleteShelfItem": {
      return validateForm(
        formData,
        deleteShelfItemSchema,
        (data) => deleteShelfItem(data.itemId),
        (errors) => data({ errors }, { status: 400 })
      );
    }

    default:
      return null;
  }
};

export default function Pantry() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const createShelfFetcher = useFetcher();

  const isSearching = navigation.formData?.has("q");

  const isCreatingShelf =
    createShelfFetcher.formData?.get("_action") === "createShelf";

  return (
    <div>
      <Form
        className={classNames(
          "flex border-2 border-gray-300 rounded-md",
          "focus-within:border-primary md:w-80",
          isSearching ? "animate-pulse" : ""
        )}
      >
        <button className="px-2">
          <SearchIcon />
        </button>
        <input
          type="text"
          name="q"
          autoComplete="off"
          placeholder="Search Shelves..."
          className="w-full py-3 px-2 outline-none"
        />
      </Form>
      <createShelfFetcher.Form method="POST">
        <PrimaryButton
          name="_action"
          value="createShelf"
          className={classNames("mt-4 w-full md:w-fit")}
          isLoading={isCreatingShelf}
        >
          <PlusIcon />
          <span className="pl-2">
            {isCreatingShelf ? "Creating shelf..." : "Create Shelf"}
          </span>
        </PrimaryButton>
      </createShelfFetcher.Form>
      <ul
        className={classNames(
          "flex gap-8 overflow-x-auto mt-4 pb-4",
          "snap-x snap-mandatory md:snap-none"
        )}
      >
        {data?.shelves.map((shelf) => (
          <Shelf key={shelf.id} shelf={shelf} />
        ))}
      </ul>
    </div>
  );
}

type ShelfProps = {
  shelf: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
    }[];
  };
};

//==========================================================
//====================FUNCION SHELF============================
//==========================================================
function Shelf({ shelf }: ShelfProps) {
  const deleteShelfFetcher = useFetcher();
  const saveShelfNameFetcher = useFetcher();
  const createShelfItemFetcher = useFetcher();

  const isDeletingShelf =
    deleteShelfFetcher.formData?.get("_action") === "deleteShelf" &&
    deleteShelfFetcher.formData?.get("shelfId") === shelf.id;

  return (
    <li
      key={shelf.id}
      className={classNames(
        "border-2 border-primary rounded-md p-4 h-fit",
        "w-[calc(100vw-2rem)] flex-none snap-center",
        "md:w-96"
      )}
    >
      {/**=============FORM PARA GUARDAR EL NOMBRE DE UNA SHELF================ */}
      <saveShelfNameFetcher.Form method="POST" className="flex">
        <div className="w-full mb-2">
          <input
            type="text"
            required
            defaultValue={shelf.name}
            className={classNames(
              "text-2xl font-extrabold w-full outline-none",
              "border-b-2 border-b-background focus:border-b-primary",
              saveShelfNameFetcher.data?.errors?.shelfName
                ? "border-b-red-600"
                : ""
            )}
            onChange={(event) =>
              event.target.value !== "" &&
              saveShelfNameFetcher.submit(
                {
                  _action: "saveShelfName",
                  shelfName: event.target.value,
                  shelfId: shelf.id,
                },
                { method: "POST" }
              )
            }
            name="shelfName"
            placeholder="Shelf Name"
            autoComplete="off"
          />
          <ErrorMessage className="pb-2">
            {saveShelfNameFetcher.data?.errors?.shelfName}
          </ErrorMessage>
        </div>
        <button name="_action" value="saveShelfName" className="ml-4">
          <SaveIcon />
        </button>
        <input type="hidden" name="shelfId" value={shelf.id} />
      </saveShelfNameFetcher.Form>

      {/**==============FORM PARA CREAR ITEM======================= */}
      <createShelfItemFetcher.Form
        reloadDocument
        method="POST"
        className="flex PY-2"
      >
        <div className="w-full mb-2">
          <input
            type="text"
            className={classNames(
              " w-full outline-none",
              "border-b-2 border-b-background focus:border-b-primary",
              createShelfItemFetcher.data?.errors?.itemName
                ? "border-r-red-600"
                : ""
            )}
            name="itemName"
            placeholder="New Item"
            required
            autoComplete="off"
          />
          <ErrorMessage className="pb-2">
            {createShelfItemFetcher.data?.errors?.itemName}
          </ErrorMessage>
        </div>

        <button name="_action" value="createShelfItem" className="ml-4">
          <SaveIcon />
        </button>
        <input type="hidden" name="shelfId" value={shelf.id} />
      </createShelfItemFetcher.Form>
      <ul>
        {shelf.items.map((item) => (
          <ShelfItem key={item.id} shelfItem={item} />
        ))}
      </ul>

      {/**============FORM PARA ELIMINAR UNA SHELF ====================*/}
      <deleteShelfFetcher.Form
        method="POST"
        className="pt-8"
        onSubmit={(event) => {
          if (!confirm("Are you sure you want to delete this shelf?")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="shelfId" value={shelf.id} />
        <DeleteButton
          className="w-full"
          name="_action"
          value="deleteShelf"
          isLoading={isDeletingShelf}
        >
          {isDeletingShelf ? "Deleting shelf..." : "Delete Shelf"}
        </DeleteButton>
      </deleteShelfFetcher.Form>
    </li>
  );
}

{
  /**=====================FUNCION SHELF ITEM============= */
}
type ShelfItemProps = {
  shelfItem: {
    id: string;
    name: string;
  };
};
function ShelfItem({ shelfItem }: ShelfItemProps) {
  const deleteFetchItemFetcher = useFetcher();
  return (
    <li className="py-2">
      {/**===============FORMULARIO DE ELIMINACION DE ITEM============ */}
      <deleteFetchItemFetcher.Form
        method="POST"
        className="flex"
        reloadDocument
      >
        <p className="w-full">{shelfItem.name}</p>
        <button name="_action" value="deleteShelfItem">
          <TrashIcon />
        </button>
        <input type="hidden" name="itemId" value={shelfItem.id} />
        <ErrorMessage className="pl-2">
          {deleteFetchItemFetcher.data?.errors?.itemId}
        </ErrorMessage>
      </deleteFetchItemFetcher.Form>
    </li>
  );
}
